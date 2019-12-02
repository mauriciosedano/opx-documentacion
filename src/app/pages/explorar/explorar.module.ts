import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExplorarPage } from './explorar.page';
import { InfoContextoComponent } from 'src/app/componentes/info-contexto/info-contexto.component';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

const routes: Routes = [{
  path: '',
  component: ExplorarPage
}, {
  path: 'decision/:tipo',
  loadChildren: () => import('./decision/decision.module').then(m => m.DecisionPageModule)
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentesModule
  ],
  entryComponents: [InfoContextoComponent],
  declarations: [ExplorarPage]
})
export class ExplorarPageModule { }
