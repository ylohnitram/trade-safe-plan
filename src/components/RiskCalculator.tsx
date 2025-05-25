
import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Shield, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CalculationResult {
  positionSize: number;
  leverage: number;
  marginUsed: number;
  riskUsdActual: number;
  riskPercentActual: number;
  slDistancePercent: number;
  cleanPositionSize: string;
  cleanSlPrice: string;
}

const RiskCalculator = () => {
  const [accountSize, setAccountSize] = useState<string>('1000');
  const [riskPercent, setRiskPercent] = useState<string>('2');
  const [maxMarginPercent, setMaxMarginPercent] = useState<string>('75');
  const [maxLeverage, setMaxLeverage] = useState<string>('125');
  const [entryPrice, setEntryPrice] = useState<string>('100');
  const [slPrice, setSlPrice] = useState<string>('97');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateRisk = () => {
    const accountSizeNum = parseFloat(accountSize);
    const riskPercentNum = parseFloat(riskPercent);
    const maxMarginPercentNum = parseFloat(maxMarginPercent);
    const maxLeverageNum = parseInt(maxLeverage);
    const entryPriceNum = parseFloat(entryPrice);
    const slPriceNum = parseFloat(slPrice);

    if (isNaN(accountSizeNum) || isNaN(riskPercentNum) || isNaN(maxMarginPercentNum) || 
        isNaN(maxLeverageNum) || isNaN(entryPriceNum) || isNaN(slPriceNum)) {
      toast({
        title: "Chyba",
        description: "Prosím zadejte všechny hodnoty správně",
        variant: "destructive"
      });
      return;
    }

    const riskUsdTarget = accountSizeNum * (riskPercentNum / 100);
    const slDistancePercent = Math.abs(entryPriceNum - slPriceNum) / entryPriceNum;

    let positionSize = riskUsdTarget / slDistancePercent;
    const maxMargin = accountSizeNum * (maxMarginPercentNum / 100);
    let leverage = positionSize / maxMargin;
    leverage = Math.min(leverage, maxLeverageNum);
    leverage = Math.ceil(leverage);
    leverage = Math.min(leverage, maxLeverageNum);

    let marginUsed = positionSize / leverage;
    if (marginUsed > maxMargin) {
      positionSize = maxMargin * leverage;
      marginUsed = maxMargin;
    }

    const riskUsdActual = positionSize * slDistancePercent;
    const riskPercentActual = (riskUsdActual / accountSizeNum) * 100;

    const cleanPositionSize = positionSize.toFixed(2).replace(/[^0-9.]/g, '');
    const cleanSlPrice = slPriceNum.toString();

    setResult({
      positionSize,
      leverage,
      marginUsed,
      riskUsdActual,
      riskPercentActual,
      slDistancePercent,
      cleanPositionSize,
      cleanSlPrice
    });
  };

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast({
        title: "Zkopírováno!",
        description: `Hodnota ${field} byla zkopírována do schránky`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se zkopírovat do schránky",
        variant: "destructive"
      });
    }
  };

  const CopyButton = ({ value, field, label }: { value: string; field: string; label: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all hover:bg-gray-100">
      <div className="flex flex-col">
        <span className="text-sm text-gray-600 font-medium">{label}:</span>
        <span className="text-lg font-bold text-primary">{value}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(value.replace(/[^0-9.]/g, ''), field)}
        className="ml-3 transition-all hover:scale-105"
      >
        {copiedField === field ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Calculator className="h-10 w-10" />
            Risk Management Kalkulačka
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Profesionální nástroj pro výpočet velikosti pozice a risk managementu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 animate-scale-in">
          {/* Input Card */}
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Parametry obchodu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountSize" className="text-sm font-semibold text-gray-700">
                    Velikost účtu (USD)
                  </Label>
                  <Input
                    id="accountSize"
                    type="number"
                    value={accountSize}
                    onChange={(e) => setAccountSize(e.target.value)}
                    className="h-12 text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskPercent" className="text-sm font-semibold text-gray-700">
                    Risk (% z účtu)
                  </Label>
                  <Input
                    id="riskPercent"
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    className="h-12 text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMarginPercent" className="text-sm font-semibold text-gray-700">
                    Max. využití účtu jako margin (%)
                  </Label>
                  <Input
                    id="maxMarginPercent"
                    type="number"
                    step="1"
                    value={maxMarginPercent}
                    onChange={(e) => setMaxMarginPercent(e.target.value)}
                    className="h-12 text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLeverage" className="text-sm font-semibold text-gray-700">
                    Maximální povolená páka
                  </Label>
                  <Input
                    id="maxLeverage"
                    type="number"
                    step="1"
                    value={maxLeverage}
                    onChange={(e) => setMaxLeverage(e.target.value)}
                    className="h-12 text-lg font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3">Klíčové hodnoty obchodu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryPrice" className="text-sm font-semibold text-yellow-700">
                      Vstupní cena
                    </Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="h-12 text-lg font-bold bg-yellow-100 border-yellow-300 focus:border-yellow-500"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slPrice" className="text-sm font-semibold text-yellow-700">
                      Stop Loss cena
                    </Label>
                    <Input
                      id="slPrice"
                      type="number"
                      step="0.01"
                      value={slPrice}
                      onChange={(e) => setSlPrice(e.target.value)}
                      className="h-12 text-lg font-bold bg-yellow-100 border-yellow-300 focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={calculateRisk} 
                className="w-full h-14 text-lg font-semibold transition-all hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Spočítat risk management
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                Výsledek kalkulace
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-4 text-lg">
                      📊 Co zadat do Binance:
                    </h3>
                    <div className="space-y-3">
                      <CopyButton
                        value={`$${result.positionSize.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                        field="positionSize"
                        label="Position Size"
                      />
                      <CopyButton
                        value={result.cleanSlPrice}
                        field="stopLoss"
                        label="Stop Loss"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="text-sm text-gray-600 font-medium">Leverage (Páka)</div>
                      <div className="text-2xl font-bold text-primary">{result.leverage}x</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="text-sm text-gray-600 font-medium">Margin (Záloha)</div>
                      <div className="text-2xl font-bold text-primary">
                        ${result.marginUsed.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">📈 Analýza rizika:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stop Loss vzdálenost:</span>
                        <span className="font-semibold">{(result.slDistancePercent * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Skutečný risk:</span>
                        <span className="font-semibold">
                          ${result.riskUsdActual.toFixed(2)} ({result.riskPercentActual.toFixed(2)}% z účtu)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max. využití účtu:</span>
                        <span className="font-semibold">{maxMarginPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max. povolená páka:</span>
                        <span className="font-semibold">{maxLeverage}x</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Zadejte hodnoty a klikněte na "Spočítat risk management" pro zobrazení výsledků.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
