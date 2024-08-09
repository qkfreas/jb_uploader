import { Injectable } from '@angular/core';
import { Subject, throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Connector } from './connectors.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { response } from 'express';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ConnectorsService {
  private connectors: Connector[] = [];
  private connectorsUpdated = new Subject<{
    connectors: Connector[];
    // connectorCount: number;
  }>();
  private url = 'http://localhost:3000/api/connectors';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  getConnectors(orgId: string) {
    const queryParams = new HttpParams().set(
      'token',
      this.authService.getToken()
    );
    const options = {
      params: queryParams,
    };

    this.http
      .get<any[]>('http://localhost:3000/api/connectors/' + orgId, options)
      .pipe(
        map((connectors) => {
          return {
            connectors: connectors.map((connector) => ({
              id: connector.id,
              name: connector.name,
              key: connector.key,
              secret: connector.secret,
              endpointEntityId: connector.endpointEntityId,
              functionEntityStartId: connector.functionEntityStartId,
              functionEntityEndId: connector.functionEntityEndId,
            })),
          };
        })
      )
      .subscribe({
        next: (transformedConnectorData) => {
          this.connectors = transformedConnectorData.connectors;
          this.connectorsUpdated.next({
            connectors: [...this.connectors],
          });
        },
        error: (err) => {
          // Log the error to understand any issue with the API response or mapping
          console.error('Error during mapping or subscription:', err);
        },
      });
  }

  getConnectorUpdateListener() {
    return this.connectorsUpdated.asObservable();
  }

  addConnector(orgId: string, name: string, jar: File) {
    const connectorData = new FormData();
    connectorData.append('name', name);
    connectorData.append('jar', jar, jar.name);
    connectorData.append('token', this.authService.getToken());

    this.http
      .post<{ message: string; connector: Connector }>(
        'http://localhost:3000/api/connectors/' + orgId,
        connectorData
      )
      .subscribe((responseData) => {
        this.router.navigate(['/']);
      });
  }

  deleteConnector(orgId: string, connectorId: string) {
    const queryParams = new HttpParams().set(
      'token',
      this.authService.getToken()
    );
    const options = {
      params: queryParams,
    };

    return this.http.delete(
      'http://localhost:3000/api/connectors/' + orgId + '/' + connectorId,
      options
    );
  }
}
