/*
 * -- copyright
 * OpenProject is an open source project management software.
 * Copyright (C) the OpenProject GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 3.
 *
 * OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
 * Copyright (C) 2006-2013 Jean-Philippe Lang
 * Copyright (C) 2010-2013 the ChiliProject Team
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * See COPYRIGHT and LICENSE files for more details.
 * ++
 */

import { Controller } from '@hotwired/stimulus';

export default class TouchedFieldMarkerController extends Controller {
  static targets = [
    'initialValueInput',
    'touchedFieldInput',
    'progressInput',
  ];

  declare readonly initialValueInputTargets:HTMLInputElement[];
  declare readonly touchedFieldInputTargets:HTMLInputElement[];
  declare readonly progressInputTargets:HTMLInputElement[];

  private targetFieldName:string;

  private markFieldAsTouched(event:{ target:HTMLInputElement }) {
    this.targetFieldName = event.target.name.replace(/^work_package\[([^\]]+)\]$/, '$1');
    const touchedInput = this.findTouchedInput(this.targetFieldName);

    if (touchedInput) {
      touchedInput.value = 'true';
      this.keepWorkValue();
    }
  }

  private keepWorkValue() {
    if (this.isInitialValueEmpty('estimated_hours') && !this.isTouched('estimated_hours')) {
      // let work be derived
      return;
    }

    if (this.isBeingEdited('estimated_hours')) {
      this.untouchFieldsWhenWorkIsEdited();
    } else if (this.isBeingEdited('remaining_hours')) {
      this.untouchFieldsWhenRemainingWorkIsEdited();
    } else if (this.isBeingEdited('done_ratio')) {
      this.untouchFieldsWhenPercentCompleteIsEdited();
    }
  }

  private untouchFieldsWhenWorkIsEdited() {
    if (this.areBothTouched('remaining_hours', 'done_ratio')) {
      if (this.isValueEmpty('done_ratio')) {
        this.markUntouched('done_ratio');
      } else {
        this.markUntouched('remaining_hours');
      }
    }
  }

  private untouchFieldsWhenRemainingWorkIsEdited() {
    if (this.isValueSet('estimated_hours')) {
      this.markUntouched('done_ratio');
    }
  }

  private untouchFieldsWhenPercentCompleteIsEdited() {
    if (this.isValueSet('estimated_hours')) {
      this.markUntouched('remaining_hours');
    }
  }

  private areBothTouched(fieldName1:string, fieldName2:string) {
    return this.isTouched(fieldName1) && this.isTouched(fieldName2);
  }

  private isBeingEdited(fieldName:string) {
    return fieldName === this.targetFieldName;
  }

  // Finds the hidden initial value input based on a field name.
  //
  // The initial value input field holds the initial value of the work package
  // before being set by the user or derived.
  private findInitialValueInput(fieldName:string):HTMLInputElement|undefined {
    return this.initialValueInputTargets.find((input) =>
      (input.dataset.referrerField === fieldName) || (input.dataset.referrerField === `work_package[${fieldName}]`));
  }

  // Finds the touched field input based on a field name.
  //
  // The touched input field is used to mark a field as touched by the user so
  // that the backend keeps the value instead of deriving it.
  private findTouchedInput(fieldName:string):HTMLInputElement|undefined {
    return this.touchedFieldInputTargets.find((input) =>
      (input.dataset.referrerField === fieldName) || (input.dataset.referrerField === `work_package[${fieldName}]`));
  }

  // Finds the value field input based on a field name.
  //
  // The value field input holds the current value of a progress field.
  private findValueInput(fieldName:string):HTMLInputElement|undefined {
    return this.progressInputTargets.find((input) =>
      (input.name === fieldName) || (input.name === `work_package[${fieldName}]`));
  }

  private isTouched(fieldName:string) {
    const touchedInput = this.findTouchedInput(fieldName);
    return touchedInput?.value === 'true';
  }

  private isInitialValueEmpty(fieldName:string) {
    const valueInput = this.findInitialValueInput(fieldName);
    return valueInput?.value === '';
  }

  private isValueEmpty(fieldName:string) {
    const valueInput = this.findValueInput(fieldName);
    return valueInput?.value === '';
  }

  private isValueSet(fieldName:string) {
    const valueInput = this.findValueInput(fieldName);
    return valueInput !== undefined && valueInput.value !== '';
  }

  private markUntouched(fieldName:string) {
    const touchedInput = this.findTouchedInput(fieldName);
    if (touchedInput) {
      touchedInput.value = 'false';
    }
  }
}
