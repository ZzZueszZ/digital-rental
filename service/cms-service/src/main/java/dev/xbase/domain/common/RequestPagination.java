package dev.xbase.domain.common;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

@Getter
@RequiredArgsConstructor
public class RequestPagination {
    @NonNull PageSize pageSize;
    @NonNull Page currentPage;

    public static RequestPagination ofEmpty() {
        return new RequestPagination(PageSize.ofEmpty(), Page.ofEmpty());
    }

    public boolean isEmpty() {
        return pageSize.isEmpty() && currentPage.isEmpty();
    }

    public boolean hasValue() {
        return !isEmpty();
    }

    public static RequestPagination of(Integer currentPage, Integer pageSize) {
        return new RequestPagination(new PageSize(pageSize), new Page(currentPage));
    }

    public Offset getOffset(){
        return currentPage.getOffset(pageSize);
    }

    public PageRequest toPageRequest() {
        return PageRequest.of(currentPage.value() - 1, pageSize.value());
    }
}
