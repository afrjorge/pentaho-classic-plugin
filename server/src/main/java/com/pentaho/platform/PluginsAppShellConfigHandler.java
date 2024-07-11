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

package com.pentaho.platform;

import org.apache.commons.io.IOUtils;
import org.pentaho.platform.api.engine.IPlatformReadyListener;
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

import static org.pentaho.platform.plugin.services.pluginmgr.PentahoSystemPluginManager.PLUGIN_ID;
import static org.pentaho.platform.plugin.services.pluginmgr.PentahoSystemPluginManager.SETTINGS_PREFIX;

public class PluginsAppShellConfigHandler implements IPlatformReadyListener {
  private static final String APP_SHELL_CONFIG_PREFIX = SETTINGS_PREFIX + "app-shell-config";
  private static final String APP_SHELL_CONFIG_FILENAME = "app-shell.config.json";

  private final Logger logger = LoggerFactory.getLogger( getClass() );

  private ISystemConfig systemConfig;
  private IPluginResourceLoader resLoader;


  @Override
  public void ready() throws PluginLifecycleException {
    IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() );
    systemConfig = PentahoSystem.get( ISystemConfig.class );
    resLoader = PentahoSystem.get( IPluginResourceLoader.class, null );

    pluginManager.getRegisteredPlugins().forEach( this::registerPluginAppShellConfig );
  }

  private void registerPluginAppShellConfig( String pluginId ) {
    ClassLoader loader = PentahoSystem.get( ClassLoader.class, null, Collections.singletonMap( PLUGIN_ID, pluginId ) );
    Optional.ofNullable( resLoader.getResourceAsStream( loader, APP_SHELL_CONFIG_FILENAME ) )
      .ifPresent(
        stream -> processConfigStream( pluginId, stream )
      );
  }

  private void processConfigStream( String pluginId, InputStream stream ) {
    final Properties properties = new Properties();

    try {
      final String jsonTxt = IOUtils.toString( stream, StandardCharsets.UTF_8 );
      logger.debug( "App Shell configuration for {} -> {}", pluginId, jsonTxt );
      properties.put( APP_SHELL_CONFIG_PREFIX, jsonTxt );
      registerConfiguration( pluginId, properties );
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

  private void registerConfiguration( String pluginId, Properties properties ) {
    try {
      systemConfig.registerConfiguration( new PropertiesFileConfiguration( pluginId, properties ) );
    } catch ( IOException e ) {
      // TODO Plugin app shell config will be missing, should the error be further escalated (throw)?
      logger.error( "Error registering properties for plugin: {}", pluginId, e );
    }
  }
}