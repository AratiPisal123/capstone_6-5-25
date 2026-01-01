function PrescriptionManagementPage() {
  const prescriptions = [
    { id: 'BP meds', doctor: 'Dr. Rao', issueDate: 'Oct 2025', expiryDate: 'March 20, 2025', status: 'active' },
    { id: 'Diabetes meds', doctor: 'Dr. Sen', issueDate: 'Oct 2025', expiryDate: 'March 20, 2025', status: 'active' },
    { id: 'Derma meds', doctor: 'Dr. Shah', issueDate: 'Oct 2025', expiryDate: 'March 20, 2025', status: 'expired' }
  ]

  return (
    <div className="prescription-management-page">
      <h2>Manage Prescription</h2>
      <p>Welcome back, John. Here are your saved prescriptions.</p>

      <div className="prescriptions-list">
        {prescriptions.map((rx, index) => (
          <div key={index} className="prescription-card">
            <div className="rx-header">
              <h3>
                <span className={`rx-status ${rx.status}`}>●</span>
                {rx.id}–{rx.doctor}
              </h3>
              <button className="delete-rx-btn">Delete Prescription</button>
            </div>

            <p className="rx-detail">Prescribing Sector</p>
            <p className="rx-detail">Issue date: {rx.issueDate}</p>
            <p className="rx-detail">Expiry: {rx.expiryDate}</p>

            <table className="rx-drugs-table">
              <thead>
                <tr>
                  <th>Drug</th>
                  <th>Strength</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Refills Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Amlodipine</td>
                  <td>5 mg</td>
                  <td>1-0-0</td>
                  <td>30</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PrescriptionManagementPage
