# pentaho-classic-plugin #

#### Pre-requisites for building the project:

* Maven, version 3+
* Java JDK 11

#### Building it

```
$ mvn clean install
```

This will build, unit test, and package the whole project (all of the sub-modules). The resulting BA Server plugins will
be generated in: ```assembly/target```

# rewrite.config

This is the rewrite configuration that needs to be added to the pentaho server `rewrite.config` to enable the app-shell
short-url.

```
RewriteCond %{SERVLET_PATH} ^/app-shell/.*$
RewriteCond %{REQUEST_URI} !^.*\.(jsx?|tsx?|jpe?g|css|gif|html?)$
RewriteRule ^(.*)/app-shell/.*$ $1/api/repos/app-shell/webclient/index\.html [L]

RewriteCond %{SERVLET_PATH} ^/app-shell/index\.html$
RewriteRule ^(.*)/app-shell/index\.html$ $1/app-shell/ [R=301,N]

RewriteCond %{SERVLET_PATH} ^/app-shell/?.*$
RewriteCond %{REQUEST_URI} ^.*\.(jsx?|tsx?|jpe?g|css|gif|html?)$
RewriteRule ^(.*)/app-shell/(.*)$ $1/api/repos/app-shell/webclient/$2 [L]

RewriteCond %{REQUEST_URI} ^.*/api/repos/app-shell/webclient/index\.html$ 
RewriteCond %{HTTP_REFERER} ^.*/Login?$
RewriteRule ^(.*)/api/repos/app-shell/webclient/index\.html$ $1/app-shell/ [R=301,N]
```