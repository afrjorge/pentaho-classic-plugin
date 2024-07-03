# Pentaho app-shell-home plugin #

#### Pre-requisites for building the project:
* Maven, version 3+
* Java JDK 11

#### Building it

```
$ mvn clean install
```

This will build, unit test, and package the whole project (all of the sub-modules). The resulting BA Server plugins will be generated in: ```assembly/target```

#### Development

First go to the `webclient` folder and create a file with the name `.env.development.local` with the following content:
```
VITE_BASE_URL=/
VITE_APP_SHELL_TYPE="app"
```

After that run:
```
$ npm install
$ npm run dev 
```

Before opening the dev server url make sure that you have a Pentaho Server running and are logged in.
Finally open the dev server url, that by default should be:
 - http://localhost:5173/home
