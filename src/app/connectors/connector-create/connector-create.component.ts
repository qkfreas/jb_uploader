import { Component, OnInit } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConnectorsService } from '../connectors.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Connector } from '../connectors.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-connector-create',
  templateUrl: './connector-create.component.html',
  styleUrls: ['./connector-create.component.css'],
})
export class ConnectorCreateComponent implements OnInit {
  enteredname = '';
  enteredContent = '';
  connector: Connector;
  isLoading = false;
  form: FormGroup;
  jarPreview: string;
  isError = false;
  private mode = 'create';
  private connectorId: string;

  constructor(
    public connectorsService: ConnectorsService,
    public route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      // content: new FormControl(null, { validators: [Validators.required] }),
      jar: new FormControl(null, {
        validators: [Validators.required],
        // asyncValidators: [mimeType],
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('connectorId')) {
        this.mode = 'edit';
        // this.connectorId = paramMap.get('connectorId');
        // this.isLoading = true;
        // this.connectorsService.getConnector(this.connectorId).subscribe((connectorData) => {
        //   this.isLoading = false;
        //   // this.connector = {
        //   //   id: connectorData._id,
        //   //   name: connectorData.name,
        //   //   content: connectorData.content,
        //   //   jarPath: connectorData.jarPath
        //   // };
        //   // this.form.setValue({
        //   //   name: this.connector.name,
        //   //   content: this.connector.content,
        //   //   jar: this.connector.jarPath
        //   // });
        // });
      } else {
        this.mode = 'create';
        this.connectorId = null;
      }
    });
  }

  onJarPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ jar: file });
    this.form.get('jar').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.jarPreview = file.name;
      console.log(this.jarPreview);
    };
    reader.readAsDataURL(file);
  }

  onSaveConnector() {
    if (this.form.invalid) {
      console.log("Form is invalid");
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      try {
        this.connectorsService.addConnector(this.authService.getOrgId(),this.form.value.name, this.form.value.jar);
      } catch (error) {
        this.isLoading = false;
        this.isError = true;
      }
    } else {
      // this.connectorsService.updateConnector(
      //   this.connectorId,
      //   this.form.value.name,
      //   this.form.value.content,
      //   this.form.value.jar
      // );
    }
    this.form.reset();
  }
}
