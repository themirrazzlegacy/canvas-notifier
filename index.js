// initalize assignments holder
// doesn't need to be stored - startup code takes care of that
var assignments = {};

// listen to missing assignments/assignments nearing due date
function onAssigmentData(parsed) {
  // get the current date in `Date` and milliseconds - easier to compare due date and current date in ms
  var date = new Date();
  var now = date.getTime();
  // go through each entry
  parsed.forEach(entry => {
    // get the due date of each entry
    var due = new Date(entry.due_at);
    // there is no due date... RETREAT!!
    if(due.getFullYear() < 2000) { return false; }
    // gets the amount of days until (or past) the assignment's due date
    var until_due = Math.floor( (new Date(now-date.getTime())).getTime() / 86400000 );
    // this entry prevents us from spam-notifying the user
    if(!assignments[entry.html_url]) {
      assignments[entry.html_url] = entry;
    }
    // we assign the amount of days due to the entry
    entry.until_due = until_due;
    // if the due dates don't match we run this code
    if(assignments[entry.html_url].until_due != until_due) {
      // update the due dates due to SPS Laws:tm: (Spam Protection Squad:tm:)
      assignments[entry.html_url].until_due = until_due;
      // we know the assignment is overdue
      if(until_due < 0) {
        if(!assignments[entry.html_url].knowsovd) {
          // they already know it exists, is coming up, and is overdue
          assignments[entry.html_url].knowslm = true;
          assignments[entry.html_url].knowsovd = true;
          assignments[entry.html_url].knowsofexistence = true;
          // we send the notification - 0xfd is the "ITS OVERDUE! RUUUUUUN!" type
          _send(0xfd, entry.name, entry.html_url, due, date, until_due);
        }
        return
      }
      // this assignment has less than a day left before its due
      if(until_due === 0) {
        if(!assignments[entry.html_url].knowslm) {
          // they know it exists and they have <1 day
          assignments[entry.html_url].knowslm = true;
          assignments[entry.html_url].knowsofexistence = true;
          // 0xfe is the "COMING UP POSSIBLY OVERDUE ALREADY THO" type
          _send(0xfe, entry.name, entry.html_url, due, date, until_due);
        }
        return
      }
      if(!assignments[entry.html_url].knowsofexistence) {
        assignments[entry.html_url].knowsofexistence = true;
        // 0xff is the "hey, this exists" type
        _send(0xff, entry.name, entry.html_url, due, date, until_due);
      }
    }
  });
}
