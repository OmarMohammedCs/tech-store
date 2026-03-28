import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";

type Props = {
  elements: Array<React.ReactNode>;
};

export default function BreadcrumbsComponent({ elements }: Props) {
  return (
    <Breadcrumbs size="lg" className="mb-4">
      {elements.map((element, index) => (
        <BreadcrumbItem size="lg" key={index}>{element}</BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
