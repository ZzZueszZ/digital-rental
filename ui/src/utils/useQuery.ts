import {useLocation} from "react-router-dom";
import type {Location} from "@remix-run/router";

export default function useQuery(param: string, val: unknown): unknown {
  const location: Location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get(param) || val;
}
