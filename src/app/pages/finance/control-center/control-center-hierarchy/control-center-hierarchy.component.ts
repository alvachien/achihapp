import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzResizableModule, NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormatEmitEvent, NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { finalize, ReplaySubject, takeUntil } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { RouterModule } from '@angular/router';

import { ConsoleLogTypeEnum, ControlCenter, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, ModelUtility } from '../../../../model';
import { FinanceStorageService, HomeDefineStorageService, UIStatusService } from '../../../../services';

@Component({
  selector: 'hih-control-center-hierarchy',
  imports: [
    NzPageHeaderModule,
    NzTreeModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzResizableModule,
    NzSpinModule,
    TranslocoModule,
    NzGridModule,
    NzModalModule,
    RouterModule,
  ],
  templateUrl: './control-center-hierarchy.component.html',
  styleUrl: './control-center-hierarchy.component.less'
})
export class ControlCenterHierarchyComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean;
  // Hierarchy
  arControlCenters: ControlCenter[] = [];
  ccTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }

  private readonly odataService = inject(FinanceStorageService);
  private readonly _uiStatusService = inject(UIStatusService);
  private readonly homeService = inject(HomeDefineStorageService);
  private readonly modalService = inject(NzModalService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllControlCenters()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (value: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters.',
            ConsoleLogTypeEnum.debug
          );

          this.arControlCenters = value;

          if (this.arControlCenters) {
            this.ccTreeNodes = this._buildControlCenterTree(this.arControlCenters, 1);
          }
        },
        error: (err: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col ?? 0;
    });
  }
  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (event.keys!.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const evtkey = +event.keys![0];
      const arflt = [];

      arflt.push({
        fieldName: 'ControlCenterID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: evtkey,
        highValue: 0,
        valueType: GeneralFilterValueType.number,
      });

      this.filterDocItem = arflt;
    }
  }

  private _buildControlCenterTree(value: ControlCenter[], level: number, id?: number): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (id === undefined) {
      value.forEach((val: ControlCenter) => {
        if (!val.ParentId) {
          // Root nodes!
          const node: NzTreeNodeOptions = {
            key: `${val.Id}`,
            title: val.Name + `(${val.Id})`,
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children && node.children.length > 0) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    } else {
      value.forEach((val: ControlCenter) => {
        if (val.ParentId === id) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: `${val.Id}`,
            title: val.Name + `(${val.Id})`,
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children && node.children.length > 0) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    }

    return data;
  }
}
