# tertiary-trekker
# 1. Background
This application crawls and scrapes data from University websites in Singapore, parses their content and consolidates their information into an Elasticsearch database for searching. 
Document clustering may then be performed to allow for users to discover similar webpages between University websites.

This project aims to assist prospective University students by presenting course information in a consolidated manner to facilitate comparisons.

Made for NUS Orbital 2024.

# 2. External README
Can be found at https://docs.google.com/document/d/1WzcwicQI4hg8aESSdqEEhPX5unTr_2-EmTcJpDUixUE/edit?usp=sharing

# 3. Installation
## Web Scraper
1. Clone the Repository using
```
git clone https://github.com/C5hives/tertiary-trekker
```

2. From the project directory, navigate to the `webpage-scraper` Folder.

3. Install the required dependencies using
```
npm install
```

4. Compile the Typescript project files by using the `tsc` command.

5. Run the compiled Javascript files using
```
npm start
```

## File Parser
1. Same as Web Crawler

2. From the project directory, navigate to the `webpage-parser` Folder.

3. Install the required dependencies using
```
mvn install
```

4. Run the Unit test using
```
mvn clean test
```

## Database
Check external README

## Backend
Check external README

## Frontend
Check external README

# 4. Collaborators
[Jewi](https://github.com/jewiteo)

