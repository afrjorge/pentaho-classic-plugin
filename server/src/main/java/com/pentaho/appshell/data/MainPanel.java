package com.pentaho.appshell.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties( ignoreUnknown = true )
public class MainPanel {
  public List<Views> views;
}