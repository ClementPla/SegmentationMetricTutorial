import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSliderModule } from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatIconModule} from '@angular/material/icon';
import { DrawingComponent } from './Components/drawing/drawing.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipsComponent } from './Components/tooltips/tooltips.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ConfMatComponent } from './Components/conf-mat/conf-mat.component';
import { MetricsComponent } from './Components/metrics/metrics.component';
import { ClassesService } from './Services/classes.service';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltipModule} from '@angular/material/tooltip'

@NgModule({
  declarations: [
    AppComponent,
    DrawingComponent,
    TooltipsComponent,
    ConfMatComponent,
    MetricsComponent,
  ],
  imports: [
    MatIconModule,
    MatButtonToggleModule,
    MatListModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDividerModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatSliderModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTooltipModule
  ],
  providers: [ClassesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
