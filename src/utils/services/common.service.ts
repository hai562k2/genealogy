import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from '../dto/pagination.dto';
import { ResponseHelper } from '../helpers/response.helper';
import { AppConstant } from '../app.constant';
import { FilterOperationDto } from '../dto/filter-operation.dto';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCodeEnum } from '../error-code.enum';
import { Response } from 'express';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import Papa from 'papaparse';

@Injectable()
export class CommonService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * Get all information user from jwt token
   *
   * @param request
   * @returns
   */

  /**
   * @param accountIdLogged
   * @param accountId
   */
  isProfileOwner(accountIdLogged: number, accountId: number) {
    if (accountIdLogged !== accountId) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async getDataByPagination(paginationDto: PaginationDto, repository, callback?: (items) => void) {
    const { page, limit } = paginationDto;
    const offset = page == 0 ? 0 : (page - 1) * limit;
    const [items, total] = await repository.skip(offset).take(limit).getManyAndCount();

    let itemResponse = items;
    if (callback) {
      itemResponse = await callback(items);
    }

    return ResponseHelper.success({
      items: itemResponse,
      page,
      limit,
      total,
    });
  }

  async responseTagRelation(items) {
    return await Promise.all(
      items.map(async (item) => {
        const tagRelation = (await Promise.all(item.tagRelation.map((tag) => tag.tag))) ?? [];

        return {
          ...item,
          tagRelation,
        };
      }),
    );
  }

  /**
   * Create Query condition multiple value
   *
   * @param filterValue
   * @param tableName
   * @param columnName
   * @returns
   */
  createQueryMultipleValue(
    filterValue: string,
    tableName: string,
    columnName: string,
    type = AppConstant.TYPE_QUERY_STRING,
    subColumnName = '',
  ) {
    const listFilter = filterValue?.split(',');
    const parameters: Record<string, string | number> = {};
    const queryString: string[] = [];

    listFilter.forEach((filter, index) => {
      const paramName = `${columnName}_${index}`;
      parameters[paramName] = type === AppConstant.TYPE_QUERY_JSON ? filter.toString() : filter;
      queryString.push(`${this.switchTypeQueryOperation(tableName, columnName, subColumnName, type)} :${paramName}`);
    });

    return {
      queryString: queryString?.join(' OR '),
      parameters,
    };
  }

  /**
   * Switch string query sql condition by json or normal
   *
   * @param type
   * @param tableName
   * @param columnName
   * @param subColumnName
   * @returns
   */
  switchTypeQueryOperation(
    tableName: string,
    columnName: string,
    subColumnName = '',
    type = AppConstant.TYPE_QUERY_STRING,
  ) {
    const queryOperation =
      type === AppConstant.TYPE_QUERY_JSON ? `${columnName}->'${subColumnName}' @>` : `${tableName}.${columnName} =`;
    return queryOperation;
  }

  generateQueryBuilderFilter(
    filterValue: string | FilterOperationDto[],
    tableName: string,
    columnName: string,
    type = AppConstant.TYPE_QUERY_STRING,
    subColumnName = '',
  ) {
    const queryString: string[] = [];
    const parameters: string[] | number[] = [];

    if (typeof filterValue !== 'object') {
      this.handleNonObjectFilterValue(filterValue, tableName, columnName, parameters, queryString);
    } else {
      this.handleObjectFilterValue(filterValue, tableName, columnName, type, subColumnName, parameters, queryString);
    }

    return {
      queryString: queryString?.join(' AND '),
      parameters,
    };
  }

  handleNonObjectFilterValue(filterValue, tableName, columnName, parameters, queryString) {
    parameters[columnName] = `%${filterValue.toString().toLowerCase()}%`;
    if (typeof filterValue === 'number') {
      parameters[columnName] = filterValue;
      queryString.push(`${tableName}.${columnName} = :${columnName}`);
    } else {
      queryString.push(`LOWER(${tableName}.${columnName}) LIKE :${columnName}`);
    }
  }

  handleObjectFilterValue(filterValue, tableName, columnName, type, subColumnName, parameters, queryString) {
    filterValue.forEach((filter: FilterOperationDto, index) => {
      const queryStringOr: string[] = [];
      if (filter.value && filter.value?.toString().length > 0) {
        const paramName =
          type === AppConstant.TYPE_QUERY_JSON && filter.operation === AppConstant.OPERATION_EQ
            ? `${columnName}_${subColumnName}`
            : `${columnName}_${index}`;
        parameters[paramName] = filter.value;
        queryStringOr.push(
          `${this.switchOperationCondition(
            tableName,
            columnName,
            paramName,
            filter.operation ?? null,
            type,
            subColumnName,
          )}`,
        );

        if (type === AppConstant.TYPE_QUERY_JSON && filter.operation !== AppConstant.OPERATION_EQ) {
          this.handleSubFilterValue({
            filter: filter,
            tableName: tableName,
            columnName: columnName,
            type: type,
            subColumnName: subColumnName,
            paramName: paramName,
            index: index,
            parameters: parameters,
            queryStringOr: queryStringOr,
          });
        }

        queryString.push(`(${queryStringOr.join(' OR ')})`);
      }
    });
  }

  handleSubFilterValue(filterData: {
    filter: any;
    tableName: string;
    columnName: string;
    type: number;
    subColumnName: string;
    paramName: string;
    index: number;
    parameters: any;
    queryStringOr: string[];
  }) {
    const { filter, tableName, columnName, type, subColumnName, paramName, index, parameters, queryStringOr } =
      filterData;

    filter.value.forEach((value: any, valueIndex: number) => {
      const subParamName = `${paramName}_${index}_${valueIndex}`;
      parameters[subParamName] = value;
      queryStringOr.push(
        `${this.switchOperationCondition(
          tableName,
          columnName,
          subParamName,
          filter.operation ?? null,
          type,
          subColumnName,
        )}`,
      );
    });
  }
  switchOperationCondition(
    tableName: string,
    columnName: string,
    paramName: string,
    operation: string | null,
    type = AppConstant.TYPE_QUERY_STRING,
    subColumnName = '',
  ) {
    let queryOperation: string;
    switch (operation) {
      case AppConstant.OPERATION_NOT_IN:
        if (type === AppConstant.TYPE_QUERY_JSON) {
          queryOperation = `NOT ${columnName}->'${subColumnName}' @> :${paramName}::jsonb`;
        } else {
          queryOperation = `${tableName}.${columnName} NOT IN (:...${paramName}) OR ${tableName}.${columnName} IS NULL`;
        }
        break;
      case AppConstant.OPERATION_EQ:
        if (type === AppConstant.TYPE_QUERY_JSON) {
          queryOperation = `${columnName}->'${subColumnName}' @> :${paramName}`;
        } else {
          queryOperation = `${tableName}.${columnName} = :${paramName}`;
        }
        break;
      default:
        if (type === AppConstant.TYPE_QUERY_JSON) {
          queryOperation = `${columnName}->'${subColumnName}' @> :${paramName}::jsonb`;
        } else {
          queryOperation = `${tableName}.${columnName} IN (:...${paramName})`;
        }
        break;
    }

    return queryOperation;
  }

  getDaysInMonth(year: number, month: number, day = 0): number {
    return new Date(year, month, day).getDate();
  }

  addMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + months);
    return newDate;
  }

  setCustomFonts(doc: jsPDF): void {
    const fontsDirectory = this.configService.get('app.fontsDirectory', { infer: true });

    if (!fontsDirectory) {
      throw new ApiException(
        {
          font: ErrorCodeEnum.SYSTEM_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const fontPathThin = path.resolve(fontsDirectory, 'aozoraminchomedium.ttf');
    const fontDataThin = fs.readFileSync(fontPathThin).toString('base64');

    doc.addFileToVFS('aozoraminchomedium.ttf', fontDataThin);
    doc.addFont('aozoraminchomedium.ttf', 'aozoraminchomedium', 'normal');
    doc.setFont('aozoraminchomedium');
  }

  transposeData(data: any[]): (string | number)[][] {
    const result: (string | number)[][] = [];
    let isHeaderRow = true;

    const fieldLabels = {
      yearMonth: '年月',
      totalSales: '売上 合計',
      monthlySales: '商品売上',
      specificWorkContract: '特定作業受託',
      workContract: '作業受託',
      miscellaneousIncome: '雑収入',
      subsidyIncome: '補助金収入',

      costOfSales: '売上原価 合計',

      monthLaborCost: 'パート人件費',
      consultingLaborCosts: '栽培技術コンサル人件費',
      consumptionVolumePrice: '動力光熱費',
      depreciationExpense: '減価償却費',
      equipmentRepairCosts: '設備修繕費',
      seedCost: '種苗費',
      fertilizerCost: '肥料費',
      pesticidesHygieneCosts: '農薬・衛生費',
      toolsCost: '農具費',
      materialCosts: '諸材料費',
      workClothingCosts: '作業用衣料費',
      miscellaneousExpensesCosts: '雑費（予備費）',

      grossProfit: '売上総利益',
      sellingCosts: '販売費 合計',

      promotionalCosts: '販促活動費',
      packingMaterialCosts: '梱包材料費',
      logisticsCosts: '物流・輸送費',
      otherSalesCosts: 'その他販売経費',
      shippingFee: '出荷手数料(JA等)',

      directProfit: '売上総利益ー販売費',
      managementCosts: '一般管理費 合計',

      officePersonnelCosts: '本社人件費',
      rentFee: '地代・貸借料',
      insuranceSupportCosts: '農業共済掛金',
      associationFees: '組合費等',
      tax: '租税効果(固定資産税)',
      otherAdministrativeExpenses: 'その他管理経費',

      operatingIncome: '営業利益',
    };

    const keys = Object.keys(fieldLabels);

    for (const key of keys) {
      const field = fieldLabels[key];
      const row = [field];
      let yearlyTotal = 0;

      for (const item of data) {
        let value = item[key];

        if (key === 'yearMonth') {
          const month = parseInt(value.slice(5));
          value = `${month}月`;
        } else {
          value = parseInt(value);
          if (typeof value === 'number') {
            yearlyTotal += value;
          }
        }

        row.push(value);
      }

      if (isHeaderRow) {
        row.push('累計');
        isHeaderRow = false;
      } else {
        row.push(yearlyTotal.toString());
      }
      result.push(row);
    }

    const costOfSalesRatioRow = ['売上原価率'];
    const grossProfitMarginRow = ['売上総利益率'];
    const sellingExpenseRatioRow = ['販売費率'];
    const generalAndAdministrativeExpenseRateRow = ['一般管理費率'];
    const operatingProfitMarginRow = ['営業利益率'];
    let costOfSalesRatioTotal = 0;
    let grossProfitMarginTotal = 0;
    let sellingExpenseRatioTotal = 0;
    let generalAndAdministrativeExpenseRateTotal = 0;
    let operatingProfitMarginTotal = 0;

    for (const item of data) {
      const costOfSalesRatio = ((item['costOfSales'] / item['totalSales']) * 100).toFixed(2);
      const grossProfitMargin = ((item['grossProfit'] / item['totalSales']) * 100).toFixed(2);
      const sellingExpenseRatio = ((item['sellingCosts'] / item['totalSales']) * 100).toFixed(2);
      const generalAndAdministrativeExpenseRate = ((item['managementCosts'] / item['totalSales']) * 100).toFixed(2);
      const operatingProfitMargin = ((item['operatingIncome'] / item['totalSales']) * 100).toFixed(2);

      costOfSalesRatioRow.push(costOfSalesRatio);
      grossProfitMarginRow.push(grossProfitMargin);
      sellingExpenseRatioRow.push(sellingExpenseRatio);
      generalAndAdministrativeExpenseRateRow.push(generalAndAdministrativeExpenseRate);
      operatingProfitMarginRow.push(operatingProfitMargin);

      costOfSalesRatioTotal += parseFloat(costOfSalesRatio);
      grossProfitMarginTotal += parseFloat(grossProfitMargin);
      sellingExpenseRatioTotal += parseFloat(sellingExpenseRatio);
      generalAndAdministrativeExpenseRateTotal += parseFloat(generalAndAdministrativeExpenseRate);
      operatingProfitMarginTotal += parseFloat(operatingProfitMargin);
    }

    costOfSalesRatioRow.push(costOfSalesRatioTotal.toFixed(2));
    grossProfitMarginRow.push(grossProfitMarginTotal.toFixed(2));
    sellingExpenseRatioRow.push(sellingExpenseRatioTotal.toFixed(2));
    generalAndAdministrativeExpenseRateRow.push(generalAndAdministrativeExpenseRateTotal.toFixed(2));
    operatingProfitMarginRow.push(operatingProfitMarginTotal.toFixed(2));

    result.push(
      [''],
      costOfSalesRatioRow,
      grossProfitMarginRow,
      sellingExpenseRatioRow,
      generalAndAdministrativeExpenseRateRow,
      operatingProfitMarginRow,
    );

    return result;
  }

  chopData(data: any[]): any[][] {
    const result: any[][] = [];
    let currentYear = data[0].yearMonth.slice(0, 4);
    let currentChunk = Array(12).fill(null);

    for (const item of data) {
      const [year, month] = item.yearMonth.split('/');
      if (year !== currentYear) {
        result.push(currentChunk);
        currentYear = year;
        currentChunk = Array(12).fill(null);
      }
      currentChunk[parseInt(month) - 1] = item;
    }
    result.push(currentChunk);

    return result;
  }

  exportToPdfBusinessPlanResult(data: any[]): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [297, 420],
    });

    this.setCustomFonts(doc);

    data.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

    const chunks = this.chopData(data);
    let currentYear = '';
    const rowValues = [2, 8, 21, 22, 28, 29, 36];

    chunks.forEach((chunk, i) => {
      const filteredChunk = chunk.filter((item) => item !== null);
      const transposedData = this.transposeData(filteredChunk);
      currentYear = filteredChunk[0].yearMonth.slice(0, 4);

      const monthArray = Array(filteredChunk.length).fill('');
      monthArray.push('', '');

      transposedData.unshift(monthArray);

      const countMonths = filteredChunk.length;
      const cellWidth = countMonths < 12 ? 338 / (countMonths + 1) : 26;

      const columnStyles = {};
      for (let i = 0; i < 14; i++) {
        if (i === 0) {
          columnStyles[i] = {
            cellWidth: 45,
            fontSize: 7,
            textColor: [0, 0, 0],
          };
        } else {
          columnStyles[i] = { fontSize: 7, cellWidth: cellWidth, halign: 'right' };
        }
      }

      const cellPadding = {};

      autoTable(doc, {
        body: transposedData,
        margin: { left: 18, right: 18 },
        theme: 'grid',
        styles: { fontSize: 7, textColor: [0, 0, 0] },
        columnStyles: columnStyles,
        headStyles: { textColor: [0, 0, 0] },
        bodyStyles: {
          textColor: [0, 0, 0],
          font: 'aozoraminchomedium',
          cellWidth: 383,
          cellPadding: cellPadding,
        },
        didDrawPage: () => {
          const pageNumber = doc.internal.pages.length;
          doc.setFontSize(8);
          doc.text('ページ ' + (pageNumber - 1), doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        },
        didParseCell: (data) => {
          this.handleFirstRow(data, currentYear);
          this.handleSecondRow(data);
          this.handleRowValues(data, rowValues);
          this.handleLastRow(data);
        },
      });
      if (i < chunks.length - 1) {
        doc.addPage();
      }
    });

    return doc;
  }

  handleFirstRow(data, currentYear) {
    if (data.row.index === 0 && data.column.index === 1) {
      data.cell.colSpan = 13;
      data.cell.text = [currentYear];
      data.cell.styles.halign = 'center';
    }
    if (data.row.index === 0 && data.column.index === 0) {
      data.cell.rowSpan = 2;
      data.cell.text = ['年月'];
      data.cell.styles.valign = 'middle';
      data.cell.styles.cellPadding = { left: 2, right: 2, top: 1.6, bottom: 1.6 };
    }
  }

  handleSecondRow(data) {
    if (data.row.index === 1 && data.column.index !== 0) {
      data.cell.styles.halign = 'center';
    }
  }

  handleRowValues(data, rowValues) {
    if (rowValues.includes(data.row.index)) {
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.fillColor = [232, 226, 208];
      data.cell.styles.cellPadding = { left: 2, right: 2, top: 1.6, bottom: 1.6 };
    } else {
      data.cell.styles.cellPadding = { left: 4, right: 2, top: 1.6, bottom: 1.6 };
    }
  }

  handleLastRow(data) {
    if (data.row.index === 37) {
      data.cell.colSpan = 14;
    }
  }

  exportToCsvBusinessPlanResult(data: any[], res: Response, filename: string): void {
    const transposedData = this.transposeData(data);

    const csv = Papa.unparse(transposedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  }
}
