import React, { useState, useEffect } from 'react';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../components/styles/summary.css';
import { Link, useParams } from 'react-router-dom';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';

const Summary = () => {
  const { id } = useParams();
  const [data, setData] = useState({
    userCount: 0,
    financeData: null,
    storeData: null,
    financeSummary: {
      totalMonthlyFinances: 0,
      totalMonthlyBalance: 0,
      unpaidReservationsCount: 0,
      unpaidReservationsBalance: 0,
      paidReservationsCount: 0,
      paidReservationsBalance: 0,
      totalDailyFinances: 0,
      totalDailyBalance: 0,
      dailyUnpaidReservationsCount: 0,
      dailyUnpaidReservationsBalance: 0,
      dailyPaidReservationsCount: 0,
      dailyPaidReservationsBalance: 0,
    },
    storeSummary: {
      totalPurchases: 0,
      totalPurchaseValue: 0,
      unpaidPurchasesCount: 0,
      unpaidPurchasesValue: 0,
      paidPurchasesCount: 0,
      paidPurchasesValue: 0,
      waterCount: 0,
      preWorkoutCount: 0,
      proteinCount: 0,
    },
    combinedSummary: {
      totalFinance: 0,
      totalFinanceBalance: 0,
      totalStoreSales: 0,
      totalStoreValue: 0,
      grandTotalCount: 0,
      grandTotalValue: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Combina todas las solicitudes en una sola
        const [financeResponse, storeResponse, userResponse] = await Promise.all([
          fetch(`${environment.apiURL}/api/finances`),
          fetch(`${environment.apiURL}/api/store`),
          fetch(`${environment.apiURL}/api/users`),
        ]);
        const [financeData, storeData, userData] = await Promise.all([
          financeResponse.json(),
          storeResponse.json(),
          userResponse.json(),
        ]);

        // Procesa los datos y actualiza el estado
        const financeSummary = processFinanceData(financeData);
        const storeSummary = processStoreData(storeData);
        setData({
          userCount: userData.length,
          financeData,
          storeData,
          financeSummary,
          storeSummary,
          combinedSummary: calculateCombinedSummary(financeSummary, storeSummary),
        });
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, [id]);

  const processFinanceData = (finances) => {
    let processedData = {
      totalMonthlyFinances: 0,
      totalMonthlyBalance: 0,
      unpaidReservationsCount: 0,
      unpaidReservationsBalance: 0,
      paidReservationsCount: 0,
      paidReservationsBalance: 0,
      totalDailyFinances: 0,
      totalDailyBalance: 0,
      dailyUnpaidReservationsCount: 0,
      dailyUnpaidReservationsBalance: 0,
      dailyPaidReservationsCount: 0,
      dailyPaidReservationsBalance: 0,
    };

    finances.forEach((finance) => {
      if (finance.Plan === 'Mensual') {
        processedData.totalMonthlyFinances++;
        processedData.totalMonthlyBalance += finance.pendingBalance;

        if (finance.reservationPaymentStatus === 'No') {
          processedData.unpaidReservationsCount++;
          processedData.unpaidReservationsBalance += finance.pendingBalance;
        }

        if (finance.reservationPaymentStatus === 'Si') {
          processedData.paidReservationsCount++;
          processedData.paidReservationsBalance += finance.totalAmount;
        }
      }

      if (finance.Plan === 'Diario') {
        processedData.totalDailyFinances++;
        processedData.totalDailyBalance += finance.pendingBalance;

        if (finance.reservationPaymentStatus === 'No') {
          processedData.dailyUnpaidReservationsCount++;
          processedData.dailyUnpaidReservationsBalance += finance.pendingBalance;
        }

        if (finance.reservationPaymentStatus === 'Si') {
          processedData.dailyPaidReservationsCount++;
          processedData.dailyPaidReservationsBalance += finance.totalAmount;
        }
      }
    });

    return processedData;
  };

  const processStoreData = (storeItems) => {
    let processedData = {
      totalPurchases: 0,
      totalPurchaseValue: 0,
      unpaidPurchasesCount: 0,
      unpaidPurchasesValue: 0,
      paidPurchasesCount: 0,
      paidPurchasesValue: 0,
      waterCount: 0,
      preWorkoutCount: 0,
      proteinCount: 0,
    };

    storeItems.forEach((item) => {
      processedData.totalPurchases++;
      const purchaseValue = item.quantity * item.value;
      processedData.totalPurchaseValue += purchaseValue;

      if (item.paymentStatus === 'No') {
        processedData.unpaidPurchasesCount++;
        processedData.unpaidPurchasesValue += purchaseValue;
      } else if (item.paymentStatus === 'Si') {
        processedData.paidPurchasesCount++;
        processedData.paidPurchasesValue += purchaseValue;
      }

      switch (item.item) {
        case 'waters':
          processedData.waterCount += item.quantity;
          break;
        case 'preWorkouts':
          processedData.preWorkoutCount += item.quantity;
          break;
        case 'proteins':
          processedData.proteinCount += item.quantity;
          break;
        default:
        // Manejar otros casos o ignorar
      }
    });

    return processedData;
  };

  const calculateCombinedSummary = (financeSummary, storeSummary) => {
    let combinedSummary = {
      totalFinance: financeSummary.totalMonthlyFinances + financeSummary.totalDailyFinances,
      totalFinanceBalance: financeSummary.totalMonthlyBalance + financeSummary.totalDailyBalance,
      totalStoreSales: storeSummary.totalPurchases,
      totalStoreValue: storeSummary.totalPurchaseValue,
      grandTotalCount:
        financeSummary.totalMonthlyFinances +
        financeSummary.totalDailyFinances +
        storeSummary.totalPurchases,
      grandTotalValue:
        financeSummary.totalMonthlyBalance +
        financeSummary.totalDailyBalance +
        storeSummary.totalPurchaseValue,
    };

    return combinedSummary;
  };

  const formattedCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };




  return (
    <div>
      <h2 style={{ color: 'white', fontSize: '30px' }} className="summary-title">
        Dashboard Financiero
      </h2>
      <Link to={`/reservationHistory/${id}`}>
        <button className="butom-day-finance-hist">
          <FontAwesomeIcon icon={faDollarSign} />
        </button>
      </Link>
      <h3 style={{ color: '#ffdd00', fontSize: '25px' }}>Total de Usuarios: {data.userCount}</h3>
      <div className="summary-container">
        {data.financeData && data.storeData && (
          <div>
            <div className="card-header">
              <div className="card-title">Resumen General</div>
            </div>
            <table className="two-column-table">
              <tbody>
                <tr>
                  <td>Total de Finanzas:</td>
                  <td>
                    <strong>{data.combinedSummary.totalFinance}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Balance Total Financiero:</td>
                  <td>
                    <strong>{formattedCurrency(data.combinedSummary.totalFinanceBalance)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Total de Ventas en Tienda:</td>
                  <td>
                    <strong>{data.combinedSummary.totalStoreSales}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Valor Total en Tienda:</td>
                  <td>
                    <strong>{formattedCurrency(data.combinedSummary.totalStoreValue)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Recuento General Total:</td>
                  <td>
                    <strong>{data.combinedSummary.grandTotalCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Valor General Total:</td>
                  <td>
                    <strong>{formattedCurrency(data.combinedSummary.grandTotalValue)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {data.financeData && (
          <div>
            <div className="card-header">
              <div className="card-title">Financiero Mensual</div>
            </div>
            <table className="two-column-table">
              <tbody>
                <tr>
                  <td>Total de Finanzas Mensuales:</td>
                  <td>
                    <strong>{data.financeSummary.totalMonthlyFinances}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Saldo Total Mensual:</td>
                  <td>
                    <strong>{formattedCurrency(data.financeSummary.totalMonthlyBalance)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Usuarios con Reservas no Pagadas:</td>
                  <td>
                    <strong>{data.financeSummary.unpaidReservationsCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Saldo de Reservas no Pagadas:</td>
                  <td>
                    <strong>{formattedCurrency(data.financeSummary.unpaidReservationsBalance)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Usuarios con Reservas Pagadas:</td>
                  <td>
                    <strong>{data.financeSummary.paidReservationsCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Saldo de Reservas Pagadas:</td>
                  <td>
                    <strong>{formattedCurrency(data.financeSummary.paidReservationsBalance)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {data.financeData && (
          <div>
            <div className="card-header">
              <div className="card-title"> Financiero Diario</div>
            </div>
            <table className="two-column-table">
              <tbody>
                <tr>
                  <td>Total de Finanzas Diarias:</td>
                  <td>
                    <strong>{data.financeSummary.totalDailyFinances}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Saldo Total Diario:</td>
                  <td>
                    <strong>{formattedCurrency(data.financeSummary.totalDailyBalance)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Usuarios con Reservas Diarias no Pagadas:</td>
                  <td>
                    <strong>{data.financeSummary.dailyUnpaidReservationsCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Saldo de Reservas Diarias no Pagadas:</td>
                  <td>
                    <strong>{formattedCurrency(data.financeSummary.dailyUnpaidReservationsBalance)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Usuarios con Reservas Diarias Pagadas:</td>
                  <td>
                    <strong>{data.financeSummary.dailyPaidReservationsCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Saldo de Reservas Diarias Pagadas:</td>
                  <td>
                    <strong>{formattedCurrency(data.financeSummary.dailyPaidReservationsBalance)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {data.storeData && (
          <div>
            <div className="card-header">
              <div className="card-title">Consumo de la Tienda</div>
            </div>
            <table className="two-column-table">
              <tbody>
                <tr>
                  <td>Total de Compras:</td>
                  <td>
                    <strong>{data.storeSummary.totalPurchases}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Valor Total de Compras:</td>
                  <td>
                    <strong>{formattedCurrency(data.storeSummary.totalPurchaseValue)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Compras no Pagadas:</td>
                  <td>
                    <strong>{data.storeSummary.unpaidPurchasesCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Valor de Compras no Pagadas:</td>
                  <td>
                    <strong>{formattedCurrency(data.storeSummary.unpaidPurchasesValue)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Compras Pagadas:</td>
                  <td>
                    <strong>{formattedCurrency(data.storeSummary.paidPurchasesValue)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Cantidad de Aguas Vendidas:</td>
                  <td>
                    <strong>{data.storeSummary.waterCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Cantidad de Pre-entrenos Vendidos:</td>
                  <td>
                    <strong>{data.storeSummary.preWorkoutCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Cantidad de Proteínas Vendidas:</td>
                  <td>
                    <strong>{data.storeSummary.proteinCount}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;


