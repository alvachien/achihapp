import { Component, inject, Input } from '@angular/core';
import { InfoMessage } from '../../model';
import { NzTableModule } from 'ng-zorro-antd/table';
import { TranslocoModule } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

/**
 * Message dialog button type
 */
export enum MessageDialogButtonEnum {
  onlyok,
  yesno,
  okcancel,
  yesnocancel,
}

/**
 * Message dialog info
 */
export interface MessageDialogInfo {
  Header: string;
  Content?: string;
  ContentTable?: InfoMessage[];
  Button: MessageDialogButtonEnum;
}

export interface IMessageDialogData {
  title: string;
  infoMessages: InfoMessage[];
}


@Component({
  selector: 'hih-message-dialog',
  imports: [
    NzTableModule,
    TranslocoModule,
  ],
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.less'
})
export class MessageDialogComponent {
  @Input() title = '';
  @Input() infoMessages: InfoMessage[] = [];
  private readonly modal = inject(NzModalRef);
  readonly #modal = inject(NzModalRef);
  readonly inputdata: IMessageDialogData = inject(NZ_MODAL_DATA);
  constructor() {}

  handleOk(): void {
    this.modal.destroy();
  }
  handleCancel() {
    this.modal.destroy();
  }
}


/**
 * @description Popup a dialog
 * @param modalService Instance of NzModalService,
 * @param title Title of the dialog,
 * @param msgs Message table,
 * @param buttons Buttons in footer
 */
export function popupDialog(
  modalService: NzModalService,
  title: string,
  msgs: InfoMessage[],
  buttons: MessageDialogButtonEnum = MessageDialogButtonEnum.onlyok
) {
  let footer: any = [];
  switch (buttons) {
    case MessageDialogButtonEnum.okcancel:
      footer = [
        {
          label: 'OK',
          onClick: (componentInstance: any) => componentInstance!.handleOk(),
        },
        {
          label: 'Cancel',
          onClick: (componentInstance: any) => componentInstance!.handleCancel(),
        },
      ];
      break;

    case MessageDialogButtonEnum.onlyok:
    default:
      footer = [
        {
          label: 'OK',
          onClick: (componentInstance: any) => componentInstance!.handleOk(),
        },
      ];
      break;
  }
  const modal = modalService.create<MessageDialogComponent, IMessageDialogData>({
    nzTitle: title,
    nzContent: MessageDialogComponent,
    nzData: {
      title,
      infoMessages: msgs,
    },
    nzClosable: true,
    nzMaskClosable: true,
    nzFooter: footer,
  });

  modal.afterOpen.subscribe(() => {
  });

  // Return a result when closed
  modal.afterClose.subscribe(() => {
  });

  // // delay until modal instance created
  // setTimeout(() => {
  //   const instance = modal.getContentComponent();
  //   instance.subtitle = 'sub title is changed';
  // }, 2000);
}

