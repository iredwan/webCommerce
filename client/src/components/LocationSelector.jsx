import React, { useState, useEffect } from 'react';
import { useGetAllDivisionsQuery } from '../features/division/divisionApiSlice';
import { useGetDistrictsByDivisionQuery } from '../features/district/districtApiSlice';
import { useGetPoliceStationsByDistrictQuery } from '../features/policeStation/policeStationApiSlice';

const ModernLocationSelector = ({
  onChange,
  initialDivisionName = '',
  initialDistrictName = '',
  initialPoliceStationName = '',
  required = false,
  className = '',
  disabled = false
}) => {
  const [divisionName, setDivisionName] = useState(initialDivisionName);
  const [districtName, setDistrictName] = useState(initialDistrictName);
  const [policeStationName, setPoliceStationName] = useState(initialPoliceStationName);

  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showPoliceDropdown, setShowPoliceDropdown] = useState(false);

  const [divisionSearchTerm, setDivisionSearchTerm] = useState('');
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  const [policeSearchTerm, setPoliceSearchTerm] = useState('');

  const { data: divisions = [], isLoading: divisionsLoading, error: divisionsError } = useGetAllDivisionsQuery();
  const { data: districts = [], isLoading: districtsLoading, error: districtsError } = useGetDistrictsByDivisionQuery(
    divisions.find(d => d.name === divisionName)?.divisionId,
    { skip: !divisionName }
  );
  const { data: policeStations = [], isLoading: policeLoading, error: policeError } = useGetPoliceStationsByDistrictQuery(
    districts.find(d => d.name === districtName)?.districtId,
    { skip: !districtName }
  );

  // Update state when initial values change
  useEffect(() => {
    setDivisionName(initialDivisionName);
    setDistrictName(initialDistrictName);
    setPoliceStationName(initialPoliceStationName);
  }, [initialDivisionName, initialDistrictName, initialPoliceStationName]);

  useEffect(() => {
    onChange?.({ divisionName, districtName, policeStationName });
  }, [divisionName, districtName, policeStationName]);

  const inputClass =
    'w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white';

  const dropdownClass =
    'absolute z-10 w-full mt-1 border border-neutral-300 bg-white rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-700';

  const renderDropdown = (items, loading, error, searchTerm, onSelect, labelKey = 'name', idKey = '_id') => {
    if (loading) return <div className="px-4 py-2 text-neutral-600 dark:text-gray-400">Loading...</div>;
    if (error) return <div className="px-4 py-2 text-red-600">Error loading data</div>;

    const filtered = items.filter(item =>
      item[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) return <div className="px-4 py-2 text-neutral-600 dark:text-gray-400">No matching items found</div>;

    return filtered.map((item, idx) => (
      <button
        key={item[idKey] || `item-${idx}`}
        className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-gray-600 dark:text-white"
        type="button"
        onMouseDown={() => onSelect(item[labelKey])}
      >
        {item[labelKey]} {item.bengaliName ? `(${item.bengaliName})` : ''}
      </button>
    ));
  };

  return (
    <div className={`location-selector grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Division */}
      <div className="form-group">
        <label className="block text-sm font-medium text-neutral-700 mb-1 dark:text-white">Division</label>
        <div className="relative">
          <input
            type="text"
            className={`${inputClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Search for a division"
            value={divisionSearchTerm || divisionName}
            onChange={(e) => {
              if (!disabled) {
                setDivisionSearchTerm(e.target.value);
                setShowDivisionDropdown(true);
              }
            }}
            onFocus={() => !disabled && setShowDivisionDropdown(true)}
            onBlur={() => setTimeout(() => setShowDivisionDropdown(false), 150)}
            required={required}
            disabled={disabled}
          />
          {showDivisionDropdown && !disabled && (
            <div className={dropdownClass}>
              {renderDropdown(divisions, divisionsLoading, divisionsError, divisionSearchTerm, name => {
                setDivisionName(name);
                setDistrictName('');
                setPoliceStationName('');
              })}
            </div>
          )}
        </div>
      </div>
  
      {/* District */}
      <div className="form-group">
        <label className="block text-sm font-medium text-neutral-700 mb-1 dark:text-white">District</label>
        <div className="relative">
          <input
            type="text"
            className={`${inputClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={divisionName ? 'Search for a district' : 'Select a division first'}
            value={districtSearchTerm || districtName}
            onChange={(e) => {
              if (!disabled) {
                setDistrictSearchTerm(e.target.value);
                setShowDistrictDropdown(true);
              }
            }}
            onFocus={() => !disabled && setShowDistrictDropdown(true)}
            onBlur={() => setTimeout(() => setShowDistrictDropdown(false), 150)}
            disabled={!divisionName || disabled}
            required={required}
          />
          {showDistrictDropdown && divisionName && !disabled && (
            <div className={dropdownClass}>
              {renderDropdown(districts, districtsLoading, districtsError, districtSearchTerm, name => {
                setDistrictName(name);
                setPoliceStationName('');
              })}
            </div>
          )}
        </div>
      </div>
  
      {/* Police Station */}
      <div className="form-group md:col-span-2">
        <label className="block text-sm font-medium text-neutral-700 mb-1 dark:text-white">Police Station</label>
        <div className="relative">
          <input
            type="text"
            className={`${inputClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={districtName ? 'Search for a police station' : 'Select a district first'}
            value={policeSearchTerm || policeStationName}
            onChange={(e) => {
              if (!disabled) {
                setPoliceSearchTerm(e.target.value);
                setShowPoliceDropdown(true);
              }
            }}
            onFocus={() => !disabled && setShowPoliceDropdown(true)}
            onBlur={() => setTimeout(() => setShowPoliceDropdown(false), 150)}
            disabled={!districtName || disabled}
            required={required}
          />
          {showPoliceDropdown && districtName && !disabled && (
            <div className={dropdownClass}>
              {renderDropdown(policeStations, policeLoading, policeError, policeSearchTerm, name => {
                setPoliceStationName(name);
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernLocationSelector;