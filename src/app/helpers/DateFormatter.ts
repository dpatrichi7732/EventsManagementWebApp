import { environment } from '../../environments/environment';
import { DatePipe } from '@angular/common';
import { DefaultDateFormats } from 'src/app/constants/DefaultDateFormats';
import { MsTimeZoneIndexValues } from '../constants/MSTimeZoneIndexValues';

export class DateFormatter {
    public static formatDate(datePipe:DatePipe, date: any, timeZoneCode: any = null) {
        let dateSettings = this.getDateSettings();
        const structure = dateSettings.singleDateStructure;
    
        let dateValue = datePipe.transform(date, dateSettings.singleDateFormat);
        let hourValue = datePipe.transform(date, dateSettings.timeFormat);
        let timezone : string = "";
        
        if(timeZoneCode){
            timezone =  MsTimeZoneIndexValues[timeZoneCode];
        }
        else{
            timezone =  datePipe.transform(date, dateSettings.timezoneFormat);
        }
    
        return structure.replace("[date]", dateValue)
                        .replace("[time]", hourValue)
                        .replace("[z]", timezone)
      }

    public static formatRangedDate(datePipe:DatePipe, startDateInput: any, endDateInput: any, timeZoneCode: any = null) : string {
        let dateSettings = this.getDateSettings();

        let startDateValue = datePipe.transform(startDateInput, dateSettings.rangeDateFormat);
        let endDateValue = datePipe.transform(endDateInput, dateSettings.rangeDateFormat);
        let startHourValue = datePipe.transform(startDateInput, dateSettings.timeFormat);
        let endHourValue = datePipe.transform(endDateInput, dateSettings.timeFormat);

        let timezone : string = "";
        if(timeZoneCode){
            timezone =  MsTimeZoneIndexValues[timeZoneCode];
        }
        else{
            timezone =  datePipe.transform(startDateInput, dateSettings.timezoneFormat);
        }

        const startDate = new Date(startDateInput.toString());
        const endDate = new Date(endDateInput.toString());
        let includeTime = startDate.getFullYear() == endDate.getFullYear() &&
                          startDate.getMonth() === endDate.getMonth() && 
                          startDate.getDay() ===  endDate.getDay();
        if(includeTime)
        {
            const rangeTimeStructure =  dateSettings.rangeTimeStructure;
            return rangeTimeStructure.replace("[date]", startDateValue)
                                     .replace("[startTime]", startHourValue)
                                     .replace("[endTime]", endHourValue)
                                     .replace("[z]", timezone)
        }
        
        const rangeDateStructure = dateSettings.rangeDateStructure;
        return rangeDateStructure.replace("[startDate]", startDateValue)
                                 .replace("[startTime]", startHourValue)
                                 .replace("[endDate]", endDateValue)
                                 .replace("[endTime]", endHourValue)
                                 .replace("[z]", timezone);
    }
    
    public static getDateSettings() {
        let dateSettings = DefaultDateFormats;
        if (environment.dateSettings) {
            dateSettings = environment.dateSettings;
        }

        return dateSettings;
    }
}