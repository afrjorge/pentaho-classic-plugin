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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pentaho.appshell.data.AppShellConfig;
import org.apache.commons.io.IOUtils;
import org.pentaho.platform.api.engine.IPlatformPlugin;
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
import java.util.Optional;
import java.util.Properties;
import java.util.function.BinaryOperator;
import java.util.function.UnaryOperator;

import static org.pentaho.platform.plugin.services.pluginmgr.PentahoSystemPluginManager.PLUGIN_ID;

public class AppShellConfigHandler implements IPluginLifecycleListener, IPlatformReadyListener {
  public static final String APP_SHELL = "app-shell";
  public static final String APP_SHELL_CONFIG_SETTINGS = APP_SHELL + "/config";
  public static final String APP_SHELL_IMPORT_MAP_SETTINGS = APP_SHELL + "/importmap";
  public static final String APP_SHELL_CONFIG_FILENAME = APP_SHELL + ".config.json";
  public static final String APP_SHELL_APPS_PREFIX = "@pentaho-apps";
  public static final String PENTAHO_API_REPOS_PATH = "/pentaho/api/repos";
  public static final String SETTINGS_VALUE = "value";

  private final Logger logger = LoggerFactory.getLogger( getClass() );
  private final UnaryOperator<String> toAppsKey = pluginId -> APP_SHELL_APPS_PREFIX + "/" + pluginId + "/";
  private final BinaryOperator<String> toAppsValue =
    ( pluginId, baseDir ) -> PENTAHO_API_REPOS_PATH + "/" + pluginId + "/" + baseDir + "/";

  private ObjectMapper mapper;
  private AppShellConfig appShellConfig;

  @Override
  public void ready() {
    mapper = new ObjectMapper();
    appShellConfig = new AppShellConfig();

    PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() ).getRegisteredPlugins()
      .forEach( this::handleAppShellConfigurationByPlugin );

    registerMergedConfiguration();
  }

  private void handleAppShellConfigurationByPlugin( String pluginId ) {
    Optional.ofNullable(
        PentahoSystem.get( IPluginResourceLoader.class, null ).getResourceAsStream(
          PentahoSystem.get( ClassLoader.class, null, Collections.singletonMap( PLUGIN_ID, pluginId ) ),
          APP_SHELL_CONFIG_FILENAME ) )
      .ifPresent(
        stream -> processAppShellConfigurationStreamByPlugin( pluginId, stream )
      );
  }

  private void processAppShellConfigurationStreamByPlugin( String pluginId, InputStream stream ) {
    try {
      final String jsonTxt = IOUtils.toString( stream, StandardCharsets.UTF_8 );
      logger.debug( "App Shell configuration for {} -> {}", pluginId, jsonTxt );

      // Replace all instances of '@self' with the pluginId.
      final String processedJsonTxt = jsonTxt.replace( "@self", APP_SHELL_APPS_PREFIX + "/" + pluginId );

      // 'appShellConfig' will be updated (merged) with the JSON file being read and, in addition, we extract the
      // 'baseDir' value to construct the "own" app and register it in the apps to be used in the importmap.
      AppShellConfig pluginAppShellConfig =
        mapper.readerForUpdating( appShellConfig ).readValue( processedJsonTxt, AppShellConfig.class );

      IPlatformPlugin platformPlugin =
        PentahoSystem.get( IPlatformPlugin.class, null, Collections.singletonMap( PLUGIN_ID, pluginId ) );
      platformPlugin.getStaticResourceMap().put( "/" + pluginId + "/" + pluginAppShellConfig.baseDir,
        pluginAppShellConfig.baseDir );

      String key = toAppsKey.apply( pluginId );
      String value = toAppsValue.apply( pluginId, pluginAppShellConfig.baseDir );
      appShellConfig.apps.put( key, value );

      // Since we are processing and registering the merged AppShell config, this may not be necessary. Or, if we see
      // that this information can be useful then maybe see if we can "keep" it as an object (pluginAppShellConfig).
      registerAppShellConfigurationByPlugin( pluginId, processedJsonTxt );
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

  private void registerAppShellConfigurationByPlugin( String pluginId, String pluginConfig ) {
    try {
      final Properties properties = new Properties();
      properties.put( APP_SHELL_CONFIG_SETTINGS, pluginConfig );

      PentahoSystem.get( ISystemConfig.class )
        .registerConfiguration( new PropertiesFileConfiguration( pluginId, properties ) );
    } catch ( IOException e ) {
      // TODO Plugin app shell config will be missing, should the error be further escalated (throw)?
      logger.error( "Error registering properties for plugin: {}", pluginId, e );
    }
  }

  private void registerMergedConfiguration() {
    try {
      ISystemConfig systemConfig = PentahoSystem.get( ISystemConfig.class );
      Properties configProps = new Properties();
      configProps.put( SETTINGS_VALUE, mapper.writeValueAsString( appShellConfig ) );

      systemConfig.registerConfiguration( new PropertiesFileConfiguration( APP_SHELL_CONFIG_SETTINGS, configProps ) );

      Properties importmapProps = new Properties();
      importmapProps.put( SETTINGS_VALUE, mapper.writeValueAsString( appShellConfig.apps ) );

      systemConfig.registerConfiguration(
        new PropertiesFileConfiguration( APP_SHELL_IMPORT_MAP_SETTINGS, importmapProps ) );
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
}