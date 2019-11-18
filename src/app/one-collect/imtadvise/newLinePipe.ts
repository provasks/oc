import { Pipe, PipeTransform } from '@angular/core';
/*
 * Converts newlines into html breaks
 */
@Pipe({ name: 'newline' })
export class NewlinePipe implements PipeTransform {
  transform(value: string, args: string[]): any {
    value = value.replace(/\{/g, '\n{');
    value = value.replace(/\}/g, '}\n');
    value = value.replace(/,/g, ',\n');
    return value;
  }
}
