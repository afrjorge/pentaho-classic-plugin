package com.pentaho.appshell.data;

import com.fasterxml.jackson.annotation.JsonMerge;

//@JsonIgnoreProperties( ignoreUnknown = true )
public class HeaderAction {
  // something
  String bundle;

  @JsonMerge
  Config config;
}
