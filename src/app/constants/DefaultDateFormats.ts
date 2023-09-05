/**
 * Default format used when environment configuration is missing
 */
export const DefaultDateFormats = {
  singleDateFormat: "MM/dd/yyyy", // used for diplaying single date. Example: 08/20/2020.
  rangeDateFormat: "MMM d, y", // used for displaying date in a range such as [startDate] - [endDate].
  timeFormat: "H:mm", // used for displaying time. Example : 9:20 AM
  timezoneFormat: "zzz",
  convertToLocalDate: false, // if set to true will convert all dates to end users local date
  
  /**
   * Formatting template for a single date.
   * The structure will use the configurations from : 
   *  - [date] -> singleDateFormat, 
   *  - [time] -> timeFormat 
   *  - [z] -> timezoneFormat
   * Example 08/20/2020, 9:20 AM GMT+1
   */
  singleDateStructure: "[date], [time] [z]",

  /**
   * Formatting template for a date range
   * The structure will use the configurations from : 
   *  - [date] -> rangeDateFormat, 
   *  - [startTime], [endTime] -> timeFormat 
   *  - [z] -> timezoneFormat
   * Example :
   * Jun 15, 2015 21:00 - Jun 16, 2015 21:00 if startDate and endDate are on diffrent days
   * Jun 15, 2015 21:00 - 22:00 if startDate and endDate are on the same days
   */
  rangeTimeStructure: "[date] [startTime] - [endTime] [z]", // template for time range across multiple hours for a single day
  rangeDateStructure: "[startDate] [startTime]  - [endDate] [endTime] [z]",  // template for date range across multiple days
}