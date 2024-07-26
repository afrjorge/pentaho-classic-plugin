/*!
 * HITACHI VANTARA PROPRIETARY AND CONFIDENTIAL
 *
 * Copyright 2024 Hitachi Vantara. All rights reserved.
 *
 * NOTICE: All information including source code contained herein is, and
 * remains the sole property of Hitachi Vantara and its licensors. The intellectual
 * and technical concepts contained herein are proprietary and confidential
 * to, and are trade secrets of Hitachi Vantara and may be covered by U.S. and foreign
 * patents, or patents in process, and are protected by trade secret and
 * copyright laws. The receipt or possession of this source code and/or related
 * information does not convey or imply any rights to reproduce, disclose or
 * distribute its contents, or to manufacture, use, or sell anything that it
 * may describe, in whole or in part. Any reproduction, modification, distribution,
 * or public display of this information without the express written authorization
 * from Hitachi Vantara is strictly prohibited and in violation of applicable laws and
 * international treaties. Access to the source code contained herein is strictly
 * prohibited to anyone except those individuals and entities who have executed
 * confidentiality and non-disclosure agreements or other agreements with Hitachi Vantara,
 * explicitly covering such access.
 */

package com.pentaho.appshell.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.pentaho.appshell.data.AppShellConfig;
import com.pentaho.appshell.data.ImportMap;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.DataNode;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.pentaho.platform.api.engine.IPlatformPlugin;
import org.pentaho.platform.api.engine.IPlatformReadyListener;
import org.pentaho.platform.api.engine.IPluginLifecycleListener;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ISystemConfig;
import org.pentaho.platform.api.engine.PluginLifecycleException;
import org.pentaho.platform.api.repository2.unified.RepositoryFile;
import org.pentaho.platform.config.PropertiesFileConfiguration;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.util.messages.LocaleHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Optional;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.pentaho.platform.plugin.services.pluginmgr.PentahoSystemPluginManager.PLUGIN_ID;

public class AppShellConfigHandler implements IPluginLifecycleListener, IPlatformReadyListener {
  public static final String APP_SHELL_CONFIG_SETTING = "app-shell/config";
  public static final String APP_SHELL_IMPORT_MAP_SETTING = "app-shell/import-map";
  public static final String APP_SHELL_INDEX = "app-shell/index";
  public static final String APP_SHELL_CONFIG_FILENAME = "pentaho-app-shell.config.json";
  public static final String APP_SHELL_INDEX_PATH = PentahoSystem.getApplicationContext().getSolutionPath(
    "system" + RepositoryFile.SEPARATOR + "app-shell" + RepositoryFile.SEPARATOR + "webclient"
      + RepositoryFile.SEPARATOR + "index.html" );

  public static final String APP_SHELL_APPS_MODULE_ID_PREFIX = "@pentaho-apps";
  public static final String APP_SHELL_GLOBAL_CONFIG_JS_START =
    "globalThis.__appshell_config__ = ";
  public static final String APP_SHELL_GLOBAL_CONFIG_JS_END =
    ";";
  public static final String APP_SHELL_GLOBAL_CONFIG_JS_REGEX =
    "\\s*globalThis\\.__appshell_config__\\s*=\\s*(\\{.*\\})\\s*;$";
  public static final String VALUE = "value";

  private AppShellConfig appShellConfig;
  private ImportMap importMap;
  private ObjectMapper mapper;
  private final Pattern appShellGlobalConfigJsPattern = Pattern.compile( APP_SHELL_GLOBAL_CONFIG_JS_REGEX );

  private final Logger logger = LoggerFactory.getLogger( getClass() );

  @Override
  public void ready() {
    mapper = new ObjectMapper()
      .configure( DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false )
      .configure( SerializationFeature.FAIL_ON_EMPTY_BEANS, false );

    appShellConfig = new AppShellConfig();

    importMap = new ImportMap();

    try {
      registerPluginConfigs();

      registerIndex();

      registerConfiguration( APP_SHELL_CONFIG_SETTING, mapper.writeValueAsString( appShellConfig ) );

      registerConfiguration( APP_SHELL_IMPORT_MAP_SETTING, mapper.writeValueAsString( importMap ) );
    } catch ( Exception e ) {
      logger.error( "Error registering Pentaho App Shell plugins", e );
    }

    mapper = null;
  }

  private void registerIndex() throws IOException, JSONException {
    final Document doc = Jsoup.parse( new File( APP_SHELL_INDEX_PATH ), LocaleHelper.getSystemEncoding() );

    final Elements scripts = doc.getElementsByTag( "script" );

    for ( Element script : scripts ) {
      if ( script.childNodeSize() != 1 ) {
        continue;
      }

      if ( script.attributes().isEmpty() ) { // App Shell config
        final DataNode node = (DataNode) script.childNode( 0 );

        // add default App Shell config
        mapper.readerForUpdating( appShellConfig ).readValue( parseJson( getGlobalConfigFromJs( node.outerHtml() ) ) );

        // TODO: remove when App Shell supports different 'baseUrl' and 'base' header tag values
        appShellConfig.baseUrl = "/pentaho/content/app-shell/";

        // write complete App Shell config to index.html node
        node.setWholeData( APP_SHELL_GLOBAL_CONFIG_JS_START + mapper.writeValueAsString( appShellConfig )
          + APP_SHELL_GLOBAL_CONFIG_JS_END );

      } else if ( script.attr( "type" ).equals( "importmap" ) ) { // Import Map
        final DataNode node = (DataNode) script.childNode( 0 );

        // add default Import Map values
        mapper.readerForUpdating( importMap ).readValue( parseJson( node.outerHtml() ) );

        // write complete Import Map to index.html node
        node.setWholeData( mapper.writeValueAsString( importMap ) );
      }
    }

    registerConfiguration( APP_SHELL_INDEX, doc.outerHtml() );
  }

  private String getGlobalConfigFromJs( String jsStr) {
    Matcher matcher = appShellGlobalConfigJsPattern.matcher( jsStr );

    if ( !matcher.matches() || matcher.groupCount() != 1 ) {
      throw new RuntimeException( "Error parsing App Shell global config" );
    }

    String configStr = matcher.group( 1 );

    if ( StringUtils.isEmpty( configStr ) ) {
      throw new RuntimeException( "Invalid App Shell global config" );
    }

    return configStr;
  }

  private String parseJson( String json ) throws JSONException {
    return ( new JSONObject( json ) ).toString();
  }

  private void registerPluginConfigs() throws JsonProcessingException {
    PentahoSystem.get( IPluginManager.class, null ).getRegisteredPlugins().forEach( pluginId -> {
      Optional.ofNullable(
        PentahoSystem.get( IPluginResourceLoader.class, null ).getResourceAsStream(
          PentahoSystem.get( ClassLoader.class, null, Collections.singletonMap( PLUGIN_ID, pluginId ) ),
          APP_SHELL_CONFIG_FILENAME )
      ).ifPresent( stream -> registerPluginConfig( pluginId, stream ) );
    } );

    // add plugins' apps into the Import Map (external modules)
    importMap.imports.putAll( appShellConfig.apps );
  }

  private void registerPluginConfig( String pluginId, InputStream stream ) {
    try {
      final String jsonTxt = IOUtils.toString( stream, StandardCharsets.UTF_8 );
      logger.debug( "App Shell configuration for {} -> {}", pluginId, jsonTxt );

      // Replace all instances of '@self' with the plugin javascript module id
      final String processedJsonTxt = jsonTxt.replace( "@self", APP_SHELL_APPS_MODULE_ID_PREFIX + "/" + pluginId );

      // merge the plugin config into the global app shell config
      mapper.readerForUpdating( appShellConfig ).readValue( processedJsonTxt);

      // add plugin module into the Import Map
      importMap.imports.put( APP_SHELL_APPS_MODULE_ID_PREFIX + "/" + pluginId + "/", "/pentaho/api/repos/" + pluginId + "/" + appShellConfig.baseDir + "/" );

      registerPluginStaticResource( pluginId, appShellConfig.baseDir );
    } catch ( IOException e ) {
      // TODO should a faulty configuration be further escalated (throw)?
      logger.error( "Error parsing app-shell.config.json for plugin: {}", pluginId, e );
    } finally {
      try {
        stream.close();
      } catch ( IOException e ) {
        logger.error( "Error closing stream for plugin: {}", pluginId, e );
      }
    }
  }

  private void registerPluginStaticResource( String pluginId, String resource ) {
    IPlatformPlugin platformPlugin =
      PentahoSystem.get( IPlatformPlugin.class, null, Collections.singletonMap( PLUGIN_ID, pluginId ) );

    assert platformPlugin != null;

    platformPlugin.getStaticResourceMap().put( "/" + pluginId + "/" + resource, resource );
  }

  private void registerConfiguration( String id, String value ) throws IOException {
    final Properties properties = new Properties();

    properties.put( VALUE, value );

    PentahoSystem.get( ISystemConfig.class ).registerConfiguration( new PropertiesFileConfiguration( id, properties ) );
  }
/*
  public Response registerIndex() throws IOException, JSONException {
    final String path = PentahoSystem.getApplicationContext()
      .getSolutionPath( "system" + RepositoryFile.SEPARATOR + "app-shell" + RepositoryFile.SEPARATOR + "webclient" + RepositoryFile.SEPARATOR + "index.html" );

    final File indexHtml = new File( path );

    Document doc = Jsoup.parse( indexHtml, "UTF-8" );

    Element head = !doc.getElementsByTag( "head" ).isEmpty() ? doc.getElementsByTag("head").get( 0 ) : null;

    Elements scripts = head != null ? head.getElementsByTag("script") : new Elements();

    for (Element script : scripts) {
      // App Shell config
      if ( script.attributes().isEmpty() ) {
        String configStr = script.childNode( 0 ).outerHtml();

        // extract config json, TODO regex
        configStr = configStr.substring( "globalThis.__appshell_config__ = ".length(), configStr.length() - 1 );

        JSONObject configJson = new JSONObject( configStr );


        mapper.readerForUpdating( appShellConfig ).readValue( configStr, AppShellConfig.class );
      } else if ( script.attr( "type" ).equals( "importmap" ) ) {
        final String importMapStr = script.childNode( 0 ).outerHtml();

        JSONObject importMap = new JSONObject( importMapStr );

        // new JSONObject(scripts.get( 2 ).childNode( 0 ).outerHtml()).get( "imports" ).toString()
        // String res = importMap.get( "imports" ).toString();


        ObjectMapper mapper = new ObjectMapper()
          .configure( DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        try {
          ImportMap config = mapper.readValue( importMapStr, ImportMap.class );
        }catch(Exception e) {}
      }
    }

    return Response.ok( doc.outerHtml(), TEXT_HTML )
      .build();
  }
*/
  /*
   * This class needs to be registered as a lifecycle-listener on plugin.xml in order for IPlatformReadyListener.ready()
   * to be called. However, only that is not enough, since for this to really be a lifecycle-listener, it also needs to
   * implement IPluginLifecycleListener to register the plugin and avoid the error on startup:
   * PluginManager.ERROR_0016 - Lifecycle listener defined for plugin app-shell ([com.pentaho.platform
   * .PluginsAppShellConfigHandler]) is not an actual lifecycle listener
   */
  @Override
  public void init() throws PluginLifecycleException {
    // ignore
  }

  @Override
  public void loaded() throws PluginLifecycleException {
    // ignore
  }

  @Override
  public void unLoaded() throws PluginLifecycleException {
    // ignore
  }
}