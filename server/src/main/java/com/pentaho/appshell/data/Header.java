package com.pentaho.appshell.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;

import java.util.ArrayList;
import java.util.List;

//@JsonIgnoreProperties( ignoreUnknown = true )
public class Header {
  @JsonMerge
  public List<HeaderAction> actions = new ArrayList<>();
}
