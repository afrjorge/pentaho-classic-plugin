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

package com.pentaho.appshell.resources;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import static com.pentaho.appshell.resources.PluginsAppShellConfigHandler.APP_SHELL_CONFIG_PREFIX;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

@Path( "/app-shell/api" )
public class PluginManagerResourceEE {
  /**
   * Retrieve the list of App Shell configurations from all registered plugins.
   *
   * @return list of <code> App Shell configurations </code>
   */
  @GET
  @Path( "/config" )
  @Produces( { APPLICATION_JSON } )
  public Response getAppShellConfig() throws JSONException {
    IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() );

    JSONArray appShellConfig = new JSONArray();

    for ( String id : pluginManager.getRegisteredPlugins() ) {
      final String s =
        (String) pluginManager.getPluginSetting( id, APP_SHELL_CONFIG_PREFIX, null );

      if ( !StringUtils.isEmpty( s ) ) {
        appShellConfig.put( new JSONObject( s ) );
      }
    }

    return Response.ok( appShellConfig.toString(), MediaType.APPLICATION_JSON ).build();
  }

  /**
   * Retrieve the list of App Shell configurations from all registered plugins.
   *
   * @return list of <code> App Shell configurations </code>
   */
  @GET
  @Path( "/config2" )
  @Produces( { APPLICATION_JSON } )
  public Response getAppShellConfig2() {
    IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() );

    JSONArray appShellConfig = pluginManager.getRegisteredPlugins().stream()
      .map( plugin -> (String) pluginManager.getPluginSetting( plugin, APP_SHELL_CONFIG_PREFIX, null ) )
      .filter( StringUtils::isNotBlank )
      .collect( Collector.of(
        JSONArray::new, //init accumulator
        JSONArray::put, //processing each element
        JSONArray::put  //confluence 2 accumulators in parallel execution
      ) );

    return Response.ok( appShellConfig.toString(), MediaType.APPLICATION_JSON ).build();
  }

  /**
   * Retrieve the list of App Shell configurations from all registered plugins.
   *
   * @return list of <code> App Shell configurations </code>
   */
  @GET
  @Path( "/config3" )
  @Produces( { APPLICATION_JSON } )
  public Response getAppShellConfig3() {
    IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, PentahoSessionHolder.getSession() );

    List<String> appShellConfig = pluginManager.getRegisteredPlugins().stream()
      .map( plugin -> (String) pluginManager.getPluginSetting( plugin, APP_SHELL_CONFIG_PREFIX, null ) )
      .filter( StringUtils::isNotBlank )
      .collect( Collectors.toList() );

    return Response.ok( appShellConfig, MediaType.APPLICATION_JSON ).build();
  }
}
