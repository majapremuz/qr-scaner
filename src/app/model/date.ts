import * as moment from 'moment';
import 'moment/locale/hr';


export class DateService {

    setLocalization(lng = 'hr'){
        moment.locale(lng);
    }

    timestampToDateTime(date: string, format: string = 'DD.MM.YYYY. HH:mm'){
        let date_mom = moment(date, 'X');
        return date_mom.format(format);
    }

    timestampToTime(date: string, format: string = 'HH:mm'){
      let date_mom = moment(date, 'X');
      return date_mom.format(format);
    }

    dbDateToDateTime(date: string, format: string = 'DD.MM.YYYY. HH:mm'){
        let date_mom = moment(date, 'YYYY-MM-DD HH:mm:ss');
        return date_mom.format(format);
    }

    dbDateToTime(date: string, format: string = 'HH:mm'){
        let date_mom = moment(date, 'YYYY-MM-DD HH:mm:ss');
        return date_mom.format(format);
    }

}