import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DotsComponent } from './heats/heat.component';
import { HttpClientModule } from '@angular/common/http';
import { NewHeatComponent } from './new-heat/new-heat.component';

@NgModule({
  declarations: [
    AppComponent,
    DotsComponent,
    NewHeatComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
