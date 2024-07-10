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

import org.apache.commons.lang.StringUtils;
import org.pentaho.platform.api.engine.IPlatformReadyListener;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.ISystemConfig;
import org.pentaho.platform.api.engine.PluginLifecycleException;
import org.pentaho.platform.config.PropertiesFileConfiguration;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Properties;

import static org.pentaho.platform.plugin.services.pluginmgr.PentahoSystemPluginManager.SETTINGS_PREFIX;

public class PluginsAppShellConfigHandler implements IPlatformReadyListener {
  public static final String APP_SHELL_CONFIG_PREFIX = SETTINGS_PREFIX + "app-shell-config";
  private final Logger logger = LoggerFactory.getLogger( getClass() );

  private IPluginManager pluginManager;
  private ISystemConfig systemConfig;

  @Override
  public void ready() throws PluginLifecycleException {
    pluginManager = PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() );
    systemConfig = PentahoSystem.get( ISystemConfig.class );

    pluginManager.getRegisteredPlugins().forEach( this::registerPluginAppShelConfig );
  }

  private void registerPluginAppShelConfig( String pluginId ) {
    final Properties properties = new Properties();
    final String appShellConfig =
      (String) pluginManager.getPluginSetting( pluginId, APP_SHELL_CONFIG_PREFIX, null );

    if ( !StringUtils.isEmpty( appShellConfig ) ) {
      properties.put( pluginId, appShellConfig );
      try {
        systemConfig.registerConfiguration( new PropertiesFileConfiguration( pluginId, properties ) );
      } catch ( IOException e ) {
        logger.error( "Error registering app-shell properties for plugin: {}", pluginId, e );
      }
    }
  }
}