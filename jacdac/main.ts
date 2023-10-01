namespace modules {

    /**
     * The SCD40 temperature sensor
     */
    //% fixedInstance whenUsed block="SCD40 temperature"
    export const kitronikTemperature = new TemperatureClient(
        "SCD40 temperature?dev=self&variant=Outdoor"
    )

    /**
     * The SCD40 air humidity sensor
     */
    //% fixedInstance whenUsed block="SCD40 humidity"
    export const SCD40Humidity = new HumidityClient(
        "SCD40 humidity?dev=self"
    )

    /**
     * The SCD40 CO2
     */
    //% fixedInstance whenUsed block="kitronik CO2"
    export const SCD40CO2 = new ECO2Client("SCD40 CO2?dev=self")

}

namespace servers {
    const STREAMING_INTERVAL = 1000

    function createServers() {
        let ready = false
        // start all servers on hardware
        const servers: jacdac.Server[] = [
            jacdac.createSimpleSensorServer(
                jacdac.SRV_TEMPERATURE,
                jacdac.TemperatureRegPack.Temperature,
                () => SCD40.get_temperature(SCD40.SCD40_T_UNIT.C),
                {
                    streamingInterval: STREAMING_INTERVAL,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }
            ),           
            jacdac.createSimpleSensorServer(
                jacdac.SRV_HUMIDITY,
                jacdac.HumidityRegPack.Humidity,
                () => SCD40.get_relative_humidity(),
                {
                    streamingInterval: STREAMING_INTERVAL,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }
            ),
            jacdac.createSimpleSensorServer(
                jacdac.SRV_E_CO2,
                jacdac.ECO2RegPack.ECO2,
                () => SCD40.get_co2(),
                {
                    streamingInterval: STREAMING_INTERVAL,
                    statusCode: jacdac.SystemStatusCodes.Initializing                                        
                }
            ),
        ]


        control.runInBackground(() => {
            for (const serv of servers)
                serv.setStatusCode(jacdac.SystemStatusCodes.Ready)
            // keep polling
            while (true) {
                pause(STREAMING_INTERVAL)
                SCD40.get_relative_humidity()
                SCD40.get_temperature(SCD40.SCD40_T_UNIT.C)
                SCD40.get_co2()
            }
        })
    return servers
    }

    function start() {
        jacdac.productIdentifier = 0x3c1974e8
        jacdac.deviceDescription = "Sensirion SCD40"
        jacdac.startSelfServers(() => createServers())
    }
    start()
}