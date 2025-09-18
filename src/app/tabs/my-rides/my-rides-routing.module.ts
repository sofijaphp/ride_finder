import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyRidesPage } from './my-rides.page';

const routes: Routes = [
  {
    path: '',
    component: MyRidesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyRidesPageRoutingModule {}
