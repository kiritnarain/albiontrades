//Exported Utility functions
//Returns a string containing the number of minutes represented by dateDiff(miliseconds) if <1 hour,
//Otherwise returns number of hours represented by dateDiff
export function getReadableTimeDiff(dateDiff){
    if(dateDiff<3600000){
        //Less than 1 hour, returns number of minutes
        const min = Math.floor(dateDiff/60000);
        return `${min} min`;
    }else if(dateDiff<86400000){ //less than 1 day
        //Returns number of hours
        const hours = Math.floor(dateDiff/3600000);
        if(hours===1){
            return `${hours} hour`;
        }
        return `${hours} hours`;
    }else if(dateDiff<63732700800000){ //Maximum valid timediff
        const days = Math.floor(dateDiff/86400000);
        if(days===1){
            return `${days} day`;
        }
        return `${days} days`;
    }
    return `-`; //Invalid date

}

export function getReadableTimeDiffFromNow(date){
    return getReadableTimeDiff(Date.now()-Date.parse(date+'Z'));
}

export function qualityToString(quality){
    switch (parseInt(quality)) {
        case 1:
            return 'Normal';
        case 2:
            return 'Good';
        case 3:
            return 'Outstanding';
        case 4:
            return 'Excellent';
        case 5:
            return 'Masterpiece'

    }
}
