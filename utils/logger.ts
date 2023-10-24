// Extracting logging into its own module is a good idea in more ways than one.
// If we wanted to start writing logs to a file or send them to an external
// logging service like graylog or papertrail we would only have to make
// changes in one place.

function info(...params: any[]) {
    console.log(...params)
}

function error(...params: any[]) {
    console.error(...params)
}

const logger = {
    info, error
}

export default logger;