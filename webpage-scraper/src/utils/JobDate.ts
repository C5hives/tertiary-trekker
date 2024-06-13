class JobDate {
    public constructor() {
        // empty
    }

    /**
     * Used to standardise date expressions.
     * 
     * @returns a formatted string representing the current date and time
     */
    public static getCurrentDateString(): string {
        const currentDate: Date = new Date();
        const formatOptions: Intl.DateTimeFormatOptions = { hour12: false };

        return currentDate.toLocaleString('en-SG', formatOptions);
    }
}

export default JobDate;