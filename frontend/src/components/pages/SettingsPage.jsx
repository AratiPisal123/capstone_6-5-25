function SettingsPage() {
  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-section">
        <h3>General Settings</h3>
        <form>
          <label>
            Language:
            <select>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>
          <label>
            Theme:
            <select>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </label>
          <label>
            Notifications:
            <input type="checkbox" defaultChecked />
          </label>
          <button type="submit">Save Changes</button>
        </form>
      </div>
      <div className="settings-section">
        <h3>Security</h3>
        <button>Change Password</button>
        <button>Enable 2FA</button>
      </div>
    </div>
  )
}

export default SettingsPage
