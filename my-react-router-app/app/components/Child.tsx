type Props = {
  id: string;
  name?: string;
};

const products = [
  { id: 1, title: "Product 1" },
  { id: 2, title: "Product 2" },
  { id: 3, title: "Product 3" },
];

const listItems = products.map((product) => (
  <li key={product.id}>{product.title}</li>
));

export default function Child({ id, name = "no name" }: Props) {
  function handleClick(message: string) {
    alert(message);
  }

  return (
    <div onClick={() => handleClick("Hello from Child")}>
      {listItems}
      {id} {name}
    </div>
  );
}
