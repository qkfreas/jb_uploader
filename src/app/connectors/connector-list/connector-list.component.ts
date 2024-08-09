import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Connector } from '../connectors.model';
import { ConnectorsService } from '../connectors.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-connector-list',
  templateUrl: './connector-list.component.html',
  styleUrls: ['./connector-list.component.css'],
})
export class ConnectorListComponent implements OnInit, OnDestroy {
  //   connectors = [
  //     { title: 'First Connector', content: 'This is connector content' },
  //     { title: 'Second Connector', content: 'This is connector content' },
  //     { title: 'Third Connector', content: 'This is connector content' },
  //   ];
  connectors: Connector[] = [];
  isLoading = false;
  totalConnectors = 0;
  connectorsPerPage = 2;
  orgId = this.authService.getOrgId();
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  private connectorsSub: Subscription;

  private authStatusSubs: Subscription;

  constructor(
    public connectorsService: ConnectorsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.connectorsService.getConnectors(this.orgId);
    this.connectorsSub = this.connectorsService
      .getConnectorUpdateListener()
      .subscribe((connectorData: { connectors: Connector[]; connectorCount: number }) => {
        this.isLoading = false;
        this.totalConnectors = connectorData.connectorCount;
        this.connectors = connectorData.connectors;
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onDelete(connectorId: string) {
    this.isLoading = true;
    this.connectorsService.deleteConnector(this.orgId,connectorId).subscribe(() => {
      this.connectorsService.getConnectors(this.orgId);
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.connectorsPerPage = pageData.pageSize;
    this.connectorsService.getConnectors(this.orgId);
  }

  ngOnDestroy(): void {
    this.connectorsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }
}
