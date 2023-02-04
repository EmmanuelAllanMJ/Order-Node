// this will run in the client not in the server
const deleteProduct = (btn) => {
  // to get the parent's elements we use parentNode
  // console.log(btn.parentNode.querySelector("[name=productId]").value);
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  // closest gives closest element with that selector/ closest ancestor element
  const productElement = btn.closest("article");
  // fetching and sending data
  // csrf not just look for id buut also query parameters
  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: { "csrf-token": csrf },
  })
    .then((result) => {
      // console.log(result);
      return result.json();
    })
    .then((data) => {
      // data - response body
      console.log(data);
      // to support IE
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
};
