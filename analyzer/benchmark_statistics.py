import numpy as np

from scipy import stats


class Statistics:
    @staticmethod
    def getNumAnalyzedSamples(samples):
        return len(samples)


    @staticmethod
    def getMin(samples):
        return np.min(samples)


    @staticmethod
    def getMax(samples):
        return np.max(samples)


    @staticmethod
    def getMean(samples):
        return np.mean(samples)


    @staticmethod
    def getPercentile(samples, percentage):
        # Based on #10 (Plotly's implementation): http://jse.amstat.org/v14n3/langford.html
        sorted_samples = np.sort(samples)
        
        norm_percentage = percentage / 100.0

        # From #10: n * p + 0.5, we substract 1 because array indexing starts from 0
        percentile_pos     = (Statistics.getNumAnalyzedSamples(samples) * norm_percentage + 0.5) - 1
        percentile_pos_int = int(percentile_pos)
        
        if percentile_pos.is_integer():
            return sorted_samples[percentile_pos_int]
        
        percentile_pos_decimal_part = percentile_pos - percentile_pos_int
        
        percentile = sorted_samples[percentile_pos_int] + percentile_pos_decimal_part * (sorted_samples[percentile_pos_int + 1] - sorted_samples[percentile_pos_int])

        return percentile


    @staticmethod
    def getIQR(samples):
        q1 = Statistics.getPercentile(samples, 25)
        q3 = Statistics.getPercentile(samples, 75)
        
        iqr = q3 - q1

        return iqr


    @staticmethod
    def getTukeyFences(samples, sensitivity=1.5):
        # Tukey's fences for outliers detection
        q1 = Statistics.getPercentile(samples, 25)
        q3 = Statistics.getPercentile(samples, 75)
        
        iqr = q3 - q1
        
        lower_fence = q1 - sensitivity * iqr
        upper_fence = q3 + sensitivity * iqr
        
        return lower_fence, upper_fence


    @staticmethod
    def getVariance(samples, ddof=0):
        # delta degrees of freedom: Plotly uses 0, for unbiased variance set to: 1
        variance = np.var(samples, ddof=ddof)
        
        return variance


    @staticmethod
    def getStdDev(samples, ddof=0):
        # delta degrees of freedom: Plotly uses 0, for unbiased variance set to: 1
        std_dev = np.std(samples, ddof=ddof)
        
        return std_dev


    @staticmethod
    def getStdErr(samples):
        return Statistics.getStdDev(samples) / np.sqrt(Statistics.getNumAnalyzedSamples(samples));


    @staticmethod
    def getMargin(samples, confidence_level=0.999):
        _, z_level = stats.t.interval(confidence_level, Statistics.getNumAnalyzedSamples(samples) - 1)
        std_err    = Statistics.getStdErr(samples)
        
        margin = z_level * std_err
        
        return margin


    @staticmethod
    def getConfidenceInterval(samples, confidence_level=0.999):
        mean   = Statistics.getMean(samples)
        margin = Statistics.getMargin(samples, confidence_level)
        
        lower = mean - margin
        upper = mean + margin
        
        return {"ci_lower": lower, "ci_upper": upper, "ci_level": confidence_level * 100.0}


    @staticmethod
    def getSkewness(samples):
        return stats.skew(samples)


    @staticmethod
    def getKurtosis(samples):
        return stats.kurtosis(samples, fisher=False)
