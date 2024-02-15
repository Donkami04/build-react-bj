import { useEffect, useState } from "react";
import { Navbar } from "../Navbar/Navbar";
import { useColMoney } from "../../hooks/useColMoney";
import axios from "axios";
import { BASE_API_URL } from "../../utils/api/bigjuice";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { ConfirmationMessage } from "../ConfirmationMessage/ConfirmationMessage";
import { CuadreCaja } from "./CuadreCaja/CuadreCaja";
import "./Sales.css";

export function Sales() {
  const [sales, setSales] = useState([]);
  const [salesNequi, setSalesNequi] = useState("$ 0");
  const [salesRappi, setSalesRappi] = useState("$ 0");
  const [total, setTotal] = useState("$ 0");
  const [totalJugos, setTotalJugos] = useState("$ 0");
  const [totalOthers, setTotalOthers] = useState("$ 0");
  const [sdate, setSdate] = useState("");
  const [edate, setEdate] = useState("");
  const [ubication, setUbication] = useState("");
  const userUbication = localStorage.getItem("ubication");
  const jwtToken = localStorage.getItem("jwtToken");
  const rol = localStorage.getItem("rol");
  const [showSalesTable, setShowSalesTable] = useState("false");
  const [showUbicationSelector, setShowUbicationSelector] = useState("false");
  const [showSalesMessage, setShowSalesMessage] = useState("false");
  const [salesMessage, setSalesMessage] = useState("");
  const [showDeleteSale, setShowDeleteSale] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [saleId, setSaleId] = useState("");
  const [saleInformation, setSaleInformation] = useState({});
  const [showCuadreCaja, setShowCuadreCaja] = useState(false);

  useEffect(() => {
    rol !== "admin"
      ? setShowUbicationSelector("false")
      : setShowUbicationSelector("");

    rol !== "admin" ? setShowDeleteSale(false) : setShowDeleteSale(true);

    setUbication(userUbication);
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1; // Los meses en JavaScript van de 0 a 11, por lo que sumamos 1
    const ano = fechaActual.getFullYear();
    const fechaFormateada = `${ano}-${mes < 10 ? "0" + mes : mes}-${
      dia < 10 ? "0" + dia : dia
    }`;
    setSdate(fechaFormateada);
    setEdate(fechaFormateada);
  }, []);

  const handleSubmit = async () => {
    if (!sdate || !edate) {
      setShowSalesMessage("");
      setSalesMessage("Por favor, selecciona ambas fechas.");
      return;
    }
    try {
      const dataTotal = await axios.post(
        `${BASE_API_URL}/sales/total`,
        {
          initialDate: sdate,
          finalDate: edate,
          ubication: ubication || userUbication,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const dataTotalJugos = await axios.post(
        `${BASE_API_URL}/sales/category`,
        {
          initialDate: sdate,
          finalDate: edate,
          category: "jugos",
          ubication: ubication || userUbication,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const dataTotalOthers = await axios.post(
        `${BASE_API_URL}/sales/category`,
        {
          initialDate: sdate,
          finalDate: edate,
          category: "otros",
          ubication: ubication || userUbication,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setShowCuadreCaja(true);
      setSales(dataTotal.data.data.sales);
      setTotal(useColMoney(dataTotal.data.data.totalSales));
      setTotalJugos(useColMoney(dataTotalJugos.data.data));
      setTotalOthers(useColMoney(dataTotalOthers.data.data));
      setShowSalesTable("");
      setShowSalesMessage("false");
    } catch (error) {
      setShowSalesTable("false");
      setShowSalesMessage(true);
      setSalesMessage(error.response.data.message || error.response.data);
    }
  };

  useEffect(() => {
    classifySales(sales);
  }, [sales]);

  const classifySales = (data) => {
    let nequiSales = 0;
    let rappiSales = 0;

    data.forEach((s) => {
      if (s.nequi === true) {
        nequiSales += s.amount;
      }
      if (s.rappi === true) {
        rappiSales += s.amount;
      }
    });
    const nequiSalesMoneyFormat = useColMoney(nequiSales);
    const rappiSalesMoneyFormat = useColMoney(rappiSales);
    setSalesNequi(nequiSalesMoneyFormat);
    setSalesRappi(rappiSalesMoneyFormat);
  };

  const deleteSale = async (saleId) => {
    try {
      const restoreProducts = await axios.post(
        `${BASE_API_URL}/products/restore-product`,
        {
          ...saleInformation,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (restoreProducts.status === 200) {
        const deleteRequest = await axios.delete(
          `${BASE_API_URL}/sales/remove/${saleId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (deleteRequest.status === 200) {
          setShowDeleteMessage(false);
          setSaleId("");
          handleSubmit(); // Actualizamos la tabla
        }

        if (restoreProducts.status !== 200 && deleteRequest !== 200) {
          throw Error;
        }
      }
    } catch (error) {
      setSalesMessage(error.response.data.message || error.response.data);
    }
  };

  const openConfirmationDeleteSale = (data) => {
    setSaleId(data.id);
    setSaleInformation(data);
    setShowDeleteMessage(true);
  };

  const closeConfirmationDeleteSale = () => {
    setShowDeleteMessage(false);
  };

  return (
    <div>
      <Navbar />
      {showCuadreCaja && (
        <CuadreCaja
          total={total}
          salesNequi={salesNequi}
          salesRappi={salesRappi}
        />
      )}
      {showDeleteMessage && (
        <ConfirmationMessage>
          <div className="container-deletesale-message">
            <p className="message-confirm-delete-supplier">
              Esta seguro que desea eliminar la venta con ID{" "}
              <span style={{ color: "red" }}>{saleId}</span>
            </p>
            {showSalesMessage && (
              <p className="sales-message">{salesMessage}</p>
            )}
            <div className="buttons-delete-supplier-container">
              <button
                className="confirm-delete-supplier"
                onClick={() => deleteSale(saleId)}
              >
                Confirmar
              </button>
              <button
                className="confirm-cancel-supplier"
                onClick={closeConfirmationDeleteSale}
              >
                Cancelar
              </button>
            </div>
          </div>
        </ConfirmationMessage>
      )}

      <div className="sales-dates-container">
        <form className="form-sales-dates">
          <div>
            <label>Fecha Inicial</label>
            <input
              className="date-selector-sales"
              value={sdate}
              type="date"
              onChange={(e) => setSdate(e.target.value)}
            ></input>
          </div>
          <div>
            <label>Fecha Final</label>
            <input
              className="date-selector-sales"
              value={edate}
              type="date"
              onChange={(e) => setEdate(e.target.value)}
            ></input>
          </div>
          <div>
            <label className={`display-${showUbicationSelector}`}>
              Ubicación
            </label>
            <select
              id="ubication"
              value={ubication}
              onChange={(e) => setUbication(e.target.value)}
              className={`display-${showUbicationSelector} ubication-selector-sales`}
            >
              <option value="" disabled>
                Selecciona...
              </option>
              <option value="villa colombia">Villa Colombia</option>
              <option value="unico">Único</option>
            </select>
          </div>
          <div className="button-bills-find">
            <p>Buscar</p>
            <FaMagnifyingGlass
              style={{ fontSize: "1.3rem", cursor: "pointer" }}
              onClick={handleSubmit}
            />
          </div>
        </form>
        {showSalesMessage && <p className="sales-message">{salesMessage}</p>}
        <section className={`totals-sales-messages display-${showSalesTable}`}>
          <table>
            <tbody>
              <tr>
                <td>Total</td>
                <td>{total}</td>
              </tr>
              <tr>
                <td>Jugos</td>
                <td>{totalJugos}</td>
              </tr>
              <tr>
                <td>Otros</td>
                <td>{totalOthers}</td>
              </tr>
              <tr>
                <td>Nequi</td>
                <td>{salesNequi}</td>
              </tr>
              <tr>
                <td>Rappi</td>
                <td>{salesRappi}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <main className={`sales-table-container display-${showSalesTable}`}>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Id Venta</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Rappi</th>
                <th>Nequi</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div className="td-delete-container">
                      {showDeleteSale && (
                        <FaRegTrashAlt
                          style={{ position: "absolute", left: "5px" }}
                          className="delete-sale-button"
                          onClick={() => openConfirmationDeleteSale(sale)}
                        />
                      )}
                      {sale.id}
                    </div>
                  </td>
                  <td>{sale.date}</td>
                  <td>{useColMoney(sale.amount)}</td>
                  <td>{sale.rappi === true ? "Si" : "No"}</td>
                  <td>{sale.nequi === true ? "Si" : "No"}</td>
                  <td>{sale.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
