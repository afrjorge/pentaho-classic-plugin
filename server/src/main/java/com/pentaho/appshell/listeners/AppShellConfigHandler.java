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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import org.apache.commons.io.IOUtils;
import org.pentaho.platform.api.engine.IPlatformReadyListener;
import org.pentaho.platform.api.engine.IPluginLifecycleListener;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ISystemConfig;
import org.pentaho.platform.api.engine.PluginLifecycleException;
import org.pentaho.platform.config.PropertiesFileConfiguration;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

import static org.pentaho.platform.plugin.services.pluginmgr.PentahoSystemPluginManager.PLUGIN_ID;

public class AppShellConfigHandler implements IPluginLifecycleListener, IPlatformReadyListener {
  public static final String APP_SHELL = "app-shell";
  public static final String APP_SHELL_CONFIG_SETTINGS = APP_SHELL + "/config";
  public static final String APP_SHELL_IMPORT_MAP_SETTINGS = APP_SHELL + "/importmap";
  public static final String APP_SHELL_CONFIG_FILENAME = APP_SHELL + ".config.json";

  private final Logger logger = LoggerFactory.getLogger( getClass() );

  private ISystemConfig systemConfig;
  private IPluginResourceLoader resLoader;
  private ObjectReader configurationReader;

  @Override
  public void ready() {
    IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() );
    systemConfig = PentahoSystem.get( ISystemConfig.class );
    resLoader = PentahoSystem.get( IPluginResourceLoader.class, null );

    // TODO hmmmmmmmmmmmmmmmmmmmmmm to double check if it goes non-POC
    ObjectMapper mapper = new ObjectMapper();
    AppShellConfig configuration = new AppShellConfig();
    configurationReader = mapper.readerForUpdating( configuration );

    pluginManager.getRegisteredPlugins().forEach( this::handleAppShellConfigurationByPlugin );

    registerMergedAppShellConfiguration( configuration );
  }

  private void handleAppShellConfigurationByPlugin( String pluginId ) {
    ClassLoader loader = PentahoSystem.get( ClassLoader.class, null, Collections.singletonMap( PLUGIN_ID, pluginId ) );
    Optional.ofNullable( resLoader.getResourceAsStream( loader, APP_SHELL_CONFIG_FILENAME ) )
      .ifPresent(
        stream -> processAppShellConfigurationStreamByPlugin( pluginId, stream )
      );
  }

  private void processAppShellConfigurationStreamByPlugin( String pluginId, InputStream stream ) {
    try {
      final Properties properties = new Properties();
      final String jsonTxt = IOUtils.toString( stream, StandardCharsets.UTF_8 );
      logger.debug( "App Shell configuration for {} -> {}", pluginId, jsonTxt );

      final String processedJsonTxt = jsonTxt.replaceAll( "@self", "@pentaho-apps/" + pluginId );

      configurationReader.readValue( processedJsonTxt, AppShellConfig.class );

      properties.put( APP_SHELL_CONFIG_SETTINGS, processedJsonTxt );

      registerAppShellConfigurationByPlugin( pluginId, properties );
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

  private void registerAppShellConfigurationByPlugin( String pluginId, Properties properties ) {
    try {
      systemConfig.registerConfiguration( new PropertiesFileConfiguration( pluginId, properties ) );
    } catch ( IOException e ) {
      // TODO Plugin app shell config will be missing, should the error be further escalated (throw)?
      logger.error( "Error registering properties for plugin: {}", pluginId, e );
    }
  }

  private void registerMergedAppShellConfiguration( AppShellConfig configuration ) {
    try {
      Properties properties = new Properties();
      ObjectMapper mapper = new ObjectMapper();

      properties.put("config", mapper.writeValueAsString( configuration ) );

      systemConfig.registerConfiguration( new PropertiesFileConfiguration( APP_SHELL, properties ) );
    } catch ( IOException e ) {
      // TODO The merged app shell config will be missing, should the error be further escalated (throw)?
      logger.error( "Error registering merged App Shell configuration:", e );
    }
  }

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

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class AppShellConfig {
    @JsonMerge
    public Map<String, String> apps;
    @JsonMerge
    public Header header;
    @JsonMerge
    public List<Menu> menu;
    @JsonMerge
    public List<Providers> providers;
    @JsonMerge
    public MainPanel mainPanel;
  }

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class Header {
    public List<HeaderActions> actions;
  }

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class HeaderActions {
    // something
  }

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class Menu {
    public String label;
    public String target;
  }

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class Providers {
    // something
  }

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class MainPanel {
    public List<Views> views;
  }

  @JsonIgnoreProperties( ignoreUnknown = true )
  public static class Views {
    public String bundle;
    public String route;
  }
}