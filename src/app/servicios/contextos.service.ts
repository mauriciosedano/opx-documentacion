import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { TextoVozService } from './texto-voz.service';
import { NetworkService, ConnectionStatus } from './network.service';
import { DataLocalService } from './data-local.service';
import { OfflineManagerService } from './offline-manager.service';
import { from } from 'rxjs';

const URL = environment.API_URL + '/datos-contexto';

@Injectable({
  providedIn: 'root'
})
export class ContextosService {

  /**
   * Servicio que representa los contextos del sistema.
   */
  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private errorService: ErrorService,
    private textoVozService: TextoVozService,
    private networkService: NetworkService,
    private dataLocalService: DataLocalService
  ) { }

  /**
   * Obtiene del backend, todos los contextos almacenados en el sistema.
   */
  listadoContextos() {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.dataLocalService.contextos());
    } else {
      return this.http.get(`${URL}/list/`)
        .pipe(map((resp: any) => {
          const contextos = resp.contextos;
          this.dataLocalService.contextos(contextos);
          return resp.contextos;
        }), catchError(e => this.errorService.handleError(e)));
    }
  }

  /**
   * Obtiene datos de categorización
   * @param barrioUbicacion Ubicación del dispocitivo movil
   * @param barrioSeleccion Barrio seleccionado
   * @param año Año por consultar
   */
  categorizacion(
    barrioUbicacion: string = '1603',
    barrioSeleccion: string = '206',
    año: number = 2010
  ) {
    const headers = new HttpHeaders({ Authorization: this.authService.token || 'null' });

    const url = `${environment.API_URL}/contextualizacion/categorizacion/` +
      `?barrioUbicacion=${barrioUbicacion}&barrioSeleccion=${barrioSeleccion}&year=${año}`;

    return this.http.get(url, { headers })
      .pipe(map((resp: any) => {
        return resp.data;
      }), catchError(e => this.errorService.handleError(e)));
  }

  /**
   * Datos de contextualización
   */
  datosContextualización(
    labelX: string = 'todo',
    barrioUbicacion: string = '1603',
    barrioSeleccion: string = '206',
    año: number = 2010
  ) {
    const headers = new HttpHeaders({ Authorization: this.authService.token || 'null' });

    let url = `${environment.API_URL}/contextualizacion/${labelX}/?barrioUbicacion=${barrioUbicacion}&barrioSeleccion=${barrioSeleccion}`;

    if (labelX !== 'todo') {
      url += `&year=${año}`;
    }

    return this.http.get(url, { headers })
      .pipe(map((resp: any) => {
        return resp.data;
      }), catchError(e => this.errorService.handleError(e)));
  }

  /**
   * Servicio que convierte texto a voz audible
   */
  reproducir(barrioUbicacion, barrioSeleccionado) {
    let txt = 'El indicador de paz para el barrio ';
    txt += `${barrioSeleccionado ? barrioSeleccionado.barrio : barrioUbicacion.barrio} en el año 2019 `;

    if (barrioSeleccionado) {
      return this.datosContextualización('todo',
        barrioUbicacion.id_barrio, barrioSeleccionado.id_barrio, 2019)
        .pipe(map(async (r: any) => {
          const index = r.labels.findIndex(f => f === 2019);
          const seleccion = r.datasets.find(f => f.label === 'Selección').data[index];
          const ubicacion = r.datasets.find(f => f.label === 'Ubicación').data[index];
          txt += `es ${seleccion} y respecto a su ubicación es ${ubicacion}.`;
          return await this.textoVozService.interpretar(txt);
        }));
    } else {
      return this.datosContextualización('todo',
        barrioUbicacion.id_barrio, barrioUbicacion.id_barrio, 2019)
        .pipe(map(async (r: any) => {
          const index = r.labels.findIndex(f => f === 2019);
          const ubicacion = r.datasets.find(f => f.label === 'Ubicación').data[index];
          txt += `es ${ubicacion}`;
          return await this.textoVozService.interpretar(txt);
        }));
    }
  }
}
