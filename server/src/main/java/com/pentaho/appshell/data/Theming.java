package com.pentaho.appshell.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;

import java.util.List;

//@JsonIgnoreProperties( ignoreUnknown = true )
public class Theming {
  public String[] themes;
  public String theme;
  public String colorMode;
}