import { NgModule } from "@angular/core";
import { ConnectorCreateComponent } from "./connector-create/connector-create.component";
import { ConnectorListComponent } from "./connector-list/connector-list.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "../angular-material.module";
import { RouterModule } from "@angular/router";

@NgModule({
    declarations: [
        ConnectorCreateComponent,
        ConnectorListComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
    ]
})
export class ConnectorsModule {}