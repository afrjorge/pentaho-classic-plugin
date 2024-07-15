package com.pentaho.appshell.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/*
 * The following classes map the defined structure of the app-shell.config.json file to be read by the backend.
 */
@JsonIgnoreProperties( ignoreUnknown = true )
public class AppShellConfig {
  @JsonProperty( access = JsonProperty.Access.WRITE_ONLY )
  public String baseDir;
  @JsonProperty( access = JsonProperty.Access.WRITE_ONLY )
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