package com.pentaho.appshell.data;

import java.util.ArrayList;
import java.util.List;

//@JsonIgnoreProperties( ignoreUnknown = true )
public class Config {
  String url;
  String description;
  String title;
  List<AppSwitcherItemConfig> apps = new ArrayList<>();
}
