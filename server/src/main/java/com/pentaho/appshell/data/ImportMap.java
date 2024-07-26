package com.pentaho.appshell.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;

import java.util.HashMap;
import java.util.Map;

//@JsonIgnoreProperties( ignoreUnknown = true )
public class ImportMap {
  @JsonMerge
  public Map<String, String> imports = new HashMap<>();
}
