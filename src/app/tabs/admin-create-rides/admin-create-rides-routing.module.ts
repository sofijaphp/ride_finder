import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCreateRidesPage } from './admin-create-rides.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCreateRidesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRidesPageRoutingModule {}
