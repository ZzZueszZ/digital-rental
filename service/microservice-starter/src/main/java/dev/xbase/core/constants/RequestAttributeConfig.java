package dev.xbase.core.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum RequestAttributeConfig {
    CreateProgram("request.action.CreateProgram"),
    CurrentRequest("request.action.CurrentRequest");

    final String value;

}
