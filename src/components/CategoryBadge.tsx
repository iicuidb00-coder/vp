import { ViolationCategory } from "@/lib/types";
import { CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/penaltyRules";
import { Badge } from "./ui/Badge";

export function CategoryBadge({ category }: { category: ViolationCategory }) {
  return <Badge className={CATEGORY_COLOR[category]}>{CATEGORY_LABEL[category]}</Badge>;
}
