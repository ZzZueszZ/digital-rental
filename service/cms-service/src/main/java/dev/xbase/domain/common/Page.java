package dev.xbase.domain.common;

import lombok.RequiredArgsConstructor;

import java.util.Objects;

@RequiredArgsConstructor
public class Page {
    final Integer value;

    public Page(String value) {
        this.value = Objects.isNull(value) ? null : Integer.valueOf(value);
    }
    public boolean isEmpty() {
        return Objects.isNull(value) || value == 0;
    }

    public boolean hasValue() {
        return !isEmpty();
    }
    public Integer value() {
        return Objects.isNull(value) ? 1 : value;
    }

    public String asText() {
        return Objects.isNull(value) ? "" : value.toString();
    }

    public static Page ofEmpty() {
        return new Page(0);
    }

    public Offset getOffset(PageSize pageSize){
        return new Offset((value-1) * pageSize.value());
     }

    public Page withTotalRow(PageSize pageSize, Long count) {
        if(Long.valueOf(getOffset(pageSize).value()) > count){
            return new Page(((Long)(count/Long.valueOf(getOffset(pageSize).value()))).intValue());
        }
        return this;
    }
}
