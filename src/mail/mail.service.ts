import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';
import { AllConfigType } from 'src/config/config.type';
import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from 'src/mailer/mailer.service';
import path from 'path';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-email.text1'),
        i18n.t('confirm-email.text2'),
        i18n.t('confirm-email.text3'),
      ]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${this.configService.get('app.frontendDomain', {
        infer: true,
      })}/confirm-email/${mailData.data.hash} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: `${this.configService.get('app.frontendDomain', {
          infer: true,
        })}/confirm-email/${mailData.data.hash}`,
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async forgotPassword(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${this.configService.get('app.frontendDomain', {
        infer: true,
      })}/password-change/${mailData.data.hash} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: `${this.configService.get('app.frontendDomain', {
          infer: true,
        })}/password-change/${mailData.data.hash}`,
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }

  async passwordOnetime(mailData: MailData<{ password: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let passwordOnetimeTitle: MaybeType<string>;

    if (i18n) {
      [passwordOnetimeTitle] = await Promise.all([i18n.t('common.passwordOnetimeTitle')]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: passwordOnetimeTitle,
      text: passwordOnetimeTitle,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'password-onetime.hbs',
      ),
      context: {
        title: passwordOnetimeTitle,
        password: mailData.data.password,
      },
    });
  }

  async inviteEmail(mailData: MailData<{ hash: string; userName: string; clanName: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let inviteEmailTitle: MaybeType<string>;
    let header: MaybeType<string>;
    let content: MaybeType<string>;
    let confirm: MaybeType<string>;

    if (i18n) {
      [inviteEmailTitle, header, content, confirm] = await Promise.all([
        i18n.t('common.inviteEmailTitle'),
        i18n.t('invite-email.header'),
        i18n.t('invite-email.content'),
        i18n.t('invite-email.confirm'),
      ]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: inviteEmailTitle,
      text: inviteEmailTitle,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'invite-email.hbs',
      ),
      context: {
        title: inviteEmailTitle,
        url: `${mailData.data.hash}`,
        userName: mailData.data.userName,
        clanName: mailData.data.clanName,
        actionTitle: inviteEmailTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        header,
        content,
        confirm,
      },
    });
  }
}
